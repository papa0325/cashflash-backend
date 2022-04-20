import * as Joi from '@hapi/joi';
import * as handlers from '../../api/public/stat';

export default [
  {
    method: 'GET',
    path: '/stat',
    handler: handlers.handler,
    options: {
      id: 'stat',
      tags: ['api', 'stat']
    }
  }
];
