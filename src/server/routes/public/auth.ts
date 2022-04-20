/*eslint-disable*/
import * as auth from '../../api/public/auth';
import * as profile from '../../api/public/profile';
import * as Joi from '@hapi/joi';
import { output, passwordValidJoiHandler,checkMemo } from '../../utils';
import { outputOkSchema } from '../../schemes';

export default [{
  method: "POST",
  path: '/auth/register',
  handler: auth.register,
  options: {
    id: 'auth.register',
    tags: ['api', 'auth'],
    description: 'Registration',
    notes: 'Registration',
    auth: false,
    validate: {
      payload: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        country: Joi.string().min(3).max(3).required(),
        nickname: Joi.string().custom(checkMemo).required(),
        password: Joi.string().custom(passwordValidJoiHandler).required(),
        ref: Joi.string().optional()
      })
    },
    response: {
      schema: outputOkSchema(Joi.object({
        access: Joi.string().required(),
        refresh: Joi.string().required()
      })),
      failAction: 'log'
    }
  }
}, {
  method: "POST",
  path: '/auth/login',
  handler: auth.login,
  options: {
    id: 'auth.login',
    tags: ['api', 'auth'],
    description: 'Login',
    notes: 'Login',
    auth: false,
    validate: {
      payload: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
        totp: Joi.string()
      })
    },
    response: {
      schema: outputOkSchema(Joi.object({
        access: Joi.string().required(),
        refresh: Joi.string().required(),
        status: Joi.number().integer().required()
      })),
      failAction: 'log'
    }
  }
}, {
  method: 'GET',
  path: '/auth/validate/access',
  handler: () => output({}),
  options: {
    id: 'auth.validate.access',
    tags: ['api', 'auth'],
    description: 'not works',
    notes: 'not works',
    auth: 'jwt-access',
    response: {
      schema: outputOkSchema(Joi.object({})),
      failAction: 'log'
    }
  }
}, {
  method: 'GET',
  path: '/auth/validate/refresh',
  handler: () => output({}),
  options: {
    id: 'auth.validate.refresh',
    tags: ['api', 'auth'],
    description: 'not works',
    notes: 'not works',
    auth: 'jwt-refresh',
    response: {
      schema: outputOkSchema(Joi.object({})),
      failAction: 'log'
    }
  }
}, {
  method: 'POST',
  path: '/auth/refresh-token',
  handler: auth.refreshToken,
  options: {
    id: 'auth.refresh-token',
    tags: ['api', 'auth'],
    description: 'Refresh access and refresh tokens',
    notes: 'Refresh access and refresh tokens',
    auth: 'jwt-refresh',
    response: {
      schema: outputOkSchema(Joi.object({
        access: Joi.string().required(),
        refresh: Joi.string().required()
      })),
      failAction: 'log'
    }
  }
}, {
  method: 'POST',
  path: '/auth/validate-email',
  handler: auth.validateEmail,
  options: {
    id: 'auth.validateEmail',
    tags: ['api', 'auth'],
    description: 'Confirm email validation code',
    notes: 'Confirm email validation code',
    validate: {
      payload: Joi.object({
        code: Joi.string().required().length(6).example("A1234A")
      })
    },
    response: {
      schema: outputOkSchema(Joi.object()),
      failAction: 'log'
    }
  }
}, {
  method: 'POST',
  path: '/auth/totp/enable',
  handler: auth.enableTotp,
  options: {
    id: 'auth.totp.enable',
    tags: ['api', 'auth', 'totp'],
    description: '2fa Enable',
    notes: '2fa Enable',
    response: {
      schema: outputOkSchema(Joi.object({
        tempTotp: Joi.string().example('MNFTU6BINV4VI6ST').required()
      })),
      failAction: 'log'
    }
  }
}, {
  method: 'POST',
  path: '/auth/totp/validate',
  handler: auth.validateTotp,
  options: {
    id: 'auth.totp.validate',
    tags: ['api', 'auth', 'totp'],
    description: '2fa code validate',
    notes: '2fa code validate',
    validate: {
      payload: Joi.object({
        totp: Joi.string().required(),
        password: Joi.string().required()
      })
    },
    response: {
      schema: outputOkSchema(Joi.object()),
      failAction: 'log'
    }
  }
}, {
  method: 'POST',
  path: '/auth/totp/disable',
  handler: auth.disableTotp,
  options: {
    id: 'auth.totp.disable',
    tags: ['api', 'auth', 'totp'],
    description: '2fa disable',
    notes: '2fa disable',
    validate: {
      payload: Joi.object({
        totp: Joi.string().required(),
        password: Joi.string().required()
      })
    },
    response: {
      schema: outputOkSchema(Joi.object()),
      failAction: 'log'
    }
  }
}, {
  method: 'GET',
  path: '/auth/totp/temp',
  handler: auth.getTempTotp,
  options: {
    id: 'auth.totp.getTemp',
    auth: 'jwt-access',
    description: 'get temp 2fa token',
    notes: 'get temp 2fa token',
    tags: ['api', 'auth', 'totp'],
    response: {
      schema: outputOkSchema(Joi.object({
        token: Joi.string().example('MNFTU6BINV4VI6ST').required()
      })),
      failAction: 'log'
    }
  }
}, {
  method: 'POST',
  path: '/auth/send-validation',
  handler: auth.sendValidateMessage,
  options: {
    id: 'auth.sendValidateMessage',
    description: 'Send validation code on email',
    notes: 'Send validation code on email',
    tags: ['api', 'auth'],
    response: {
      schema: outputOkSchema(Joi.object({})),
      failAction: 'log'
    }
  }
}, {
  method: 'GET',
  path: '/auth/totp/enabled',
  handler: auth.isTotpEnabled,
  options: {
    id: 'auth.totp.enabled',
    description: 'Check is 2fa enable',
    notes: 'Check is 2fa enable',
    tags: ['api', 'auth', 'totp'],
    response: {
      schema: outputOkSchema(Joi.object({
        enabled: Joi.boolean().required()
      })),
      failAction: 'log'
    }
  }
}, {
  method: 'POST',
  path: '/auth/restore/send',
  handler: auth.restoreSendCode,
  options: {
    auth: false,
    id: 'auth.restore.send',
    tags: ['api', 'auth', 'restore'],
    description: 'Send password reset message',
    notes: 'Send password reset message',
    validate: {
      payload: Joi.object({
        email: Joi.string().email().required()
      })
    },
    response: {
      schema: outputOkSchema(Joi.object())
    }
  }
}, {
  method: 'POST',
  path: '/auth/restore/change',
  handler: auth.restorePassword,
  options: {
    id: 'auth.restore.change',
    tags: ['api', 'auth', 'restore'],
    auth: false,
    validate: {
      payload: Joi.object({
        password: Joi.string().custom(passwordValidJoiHandler).required(),
        email: Joi.string().email().required(),
        restoreCode: Joi.string().required()
      })
    },
    response: {
      schema: outputOkSchema(Joi.object())
    }
  }
}, {
  method: 'GET',
  path: '/auth/get-countries',
  handler: profile.getCountryList,
  options: {
    id: 'auth.get.countries',
    tags: ['api', 'auth', 'countries'],
    description: 'Get country list',
    notes: 'Get country list',
    auth: false,
    response: {
      schema: outputOkSchema(Joi.object())
    }
  }
}]
