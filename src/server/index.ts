import * as Hapi from '@hapi/hapi';
import * as Nes from '@hapi/nes';
import * as Inert from '@hapi/inert';
import * as Vision from '@hapi/vision';
import * as dotenv from 'dotenv';
import { run } from 'graphile-worker/dist';
import * as Pino from 'hapi-pino';
import * as HapiBearer from 'hapi-auth-bearer-token';
import * as HapiCors from 'hapi-cors';
import * as Bell from '@hapi/bell';
import * as Basic from '@hapi/basic';
import Config from './config/server';
import config from './config/config';
import * as SwaggerOptions from './config/swagger.json';
import routes from './routes';
import sequelize from './models';
import {
  accessValidate, ipnValidate, refreshValidate, delValidate
} from './utils/auth';
import {
  addJob, checkOrCreateStorageFolders, deleteJob, error
} from './utils';

const HapiSwagger = require('hapi-swagger');

const Package = require('../../package.json');

SwaggerOptions.info.version = Package.version;

const init = async () => {
  // Инициализируем сервер
  dotenv.config();
  const server = await new Hapi.Server({
    host: Config.server.host,
    port: Config.server.port,
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction: async (r, h, err) => error(400000, 'Validation error', err.details.map((e) => ({ field: e.context.key, reason: e.type.replace('any.', '') })))
      },
      response: {
        failAction: 'log'
      }
    }
  });
  console.log("sever: ", server);
  server.realm.modifiers.route.prefix = '/api';
  // Регистрируем расширения
  await server.register([
    Bell,
    Basic,
    Nes,
    Inert,
    Vision,
    Pino,
    HapiBearer,
    { plugin: HapiSwagger, options: SwaggerOptions }
  ]);

  // Запускаем Job scheduler
  server.app.scheduler = await run({
    connectionString: config.scheduler.db,
    concurrency: config.scheduler.concurrency,
    pollInterval: config.scheduler.interval,
    taskDirectory: `${__dirname}/jobs`
  });

  await addJob('updateRates');
  await checkOrCreateStorageFolders();

  await deleteJob('ref-reward-enroll');
  // await addJob('verification-services-country-renew');
  await addJob('get-verification-fields-info');

  await addJob('bonus-for-purchase');

  server.auth.strategy('jwt-access', 'bearer-access-token', {
    validate: accessValidate
  });
  server.auth.strategy('jwt-refresh', 'bearer-access-token', {
    validate: refreshValidate
  });
  server.auth.strategy('ipn', 'basic', {
    validate: ipnValidate
  });
  server.auth.strategy('del', 'basic', {
    validate: delValidate
  });
  server.auth.default('jwt-access');

  server.route(routes);

  server.app.db = sequelize;

  server.ext('onPreResponse', (r, h) => {
    if (r.app.error) {
      r.response = h
        .response({
          ok: false,
          code: r.app.error.data.code,
          data: r.app.error.data.data,
          msg: r.app.error.output.payload.message
        })
        .code(Math.floor(r.app.error.data.code / 1000));
      return h.continue;
    }

    if (r.response.isBoom && r.response.data) {
      if (r.response.data.custom) {
        r.response = h
          .response({
            ok: false,
            code: r.response.data.code,
            data: r.response.data.data,
            msg: r.response.output.payload.message
          })
          .code(Math.floor(r.response.data.code / 1000));

        return h.continue;
      }

      return h.continue;
    }

    return h.continue;
  });

  try {
    await server.register({ plugin: HapiCors, options: config.cors });
    await server.start();
    server.log('info', `Server running at: ${server.info.uri}`);
  }
  catch (err) {
    server.log('error', JSON.stringify(err));
  }

  return server;
};

export { init };