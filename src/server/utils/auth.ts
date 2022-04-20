import * as jwt from 'jsonwebtoken';
import config from '../config/config';
import { error, getRealIp } from './index';
import { Session } from '../models/Session';
import { User } from '../models/User';

export const generateJwt = (data: object) => {
  const access = jwt.sign(data, config.auth.jwt.access.secret, { expiresIn: config.auth.jwt.access.lifetime });
  const refresh = jwt.sign(data, config.auth.jwt.refresh.secret, { expiresIn: config.auth.jwt.refresh.lifetime });

  return { access, refresh };
};

export const decodeJwt = async (token: string, secret: string) => {
  try {
    return await jwt.verify(token, secret);
  }
  catch (e) {
    const code = e.name === 'TokenExpiredError' ? 401001 : 401002;
    const msg = e.name === 'TokenExpiredError' ? 'Token expired' : 'Token invalid';
    return error(code, msg, {});
  }
};

export const accessValidate = async (r, token) => {
  const data = await decodeJwt(token, config.auth.jwt.access.secret);
  if (data.isBoom) {
    r.app.error = data;
    return data;
  }

  const session = await Session.findByPk(data.id);

  if (!session) {
    r.app.error = error(401000, 'Session not found. Please login again.', {});
    return error(401000, 'Session not found. Please login again.', {});
  }

  await r.server.app.scheduler.addJob('updateSession', {
    id: session.id,
    ip: getRealIp(r),
    date: new Date()
  });
  const user = await User.findByPk(session.userId, { attributes: { include: ['settings'] } });
  const allowedRoutes = ['auth.validateEmail', 'profile.getMe', 'auth.sendValidateMessage'];
  if (!allowedRoutes.includes(r.route.settings.id)) {
    if (user.status === 0) {
      r.app.error = error(403000, 'Validate your email first', {});
      return error(403000, 'Validate your email first', {});
    }
  }

  return { isValid: true, credentials: user, artifacts: { token, type: 'access', session: session.id } };
};

export const refreshValidate = async (r, token) => {
  const data = await decodeJwt(token, config.auth.jwt.refresh.secret);
  if (data.isBoom) {
    r.app.error = data;
    return data;
  }

  const session = await Session.findByPk(data.id);

  if (!session) {
    r.app.error = error(401000, 'Session not found. Please login again.', {});
    return error(401000, 'Session not found. Please login again.', {});
  }

  await r.server.app.scheduler.addJob('updateSession', {
    id: session.id,
    ip: getRealIp(r),
    date: new Date()
  });
  const user = await User.scope('auth').findByPk(session.userId, { attributes: { exclude: [] } });
  return { isValid: true, credentials: user, artifacts: { token, type: 'refresh', session: session.id } };
};

export const ipnValidate = async (request, username, password, h) => {
  if (username == config.gateway.serverId && password == config.gateway.serverPassword) {
    return { isValid: true, credentials: {} };
  }

  return { isValid: false, credentials: {} };
};

export const delValidate = async (request, username, password, h) => {
  if (username == config.del.login && password == config.del.password) {
    return { isValid: true, credentials: {} };
  }

  return { isValid: false, credentials: {} };
};
