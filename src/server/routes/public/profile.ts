import * as Joi from '@hapi/joi';
import * as profile from '../../api/public/profile';
import {
  outputOkSchema,
  user, profileMeValidation,
  profilePersonalInfo,
  profileCommunication,
  profileLocation,
  profileDocument
} from '../../schemes';
import { passwordValidJoiHandler } from '../../utils';
import config from '../../config/config';

export default [{
  method: 'GET',
  path: '/profile/me',
  handler: profile.getMe,
  options: {
    id: 'profile.getMe',
    tags: ['api', 'profile'],
    response: {
      schema: outputOkSchema(user),
      failAction: 'log'
    }
  }
}, {
  method: 'PUT',
  path: '/profile/me',
  handler: profile.edit,
  options: {
    id: 'profile.edit',
    tags: ['api', 'profile'],
    payload: {
      maxBytes: 5242880,
      parse: true
    },
    validate: {
      payload: profileMeValidation
    },
    response: {
      schema: outputOkSchema(Joi.object()),
      failAction: 'log'
    }
  }
}, {
  method: 'PUT',
  path: '/profile/me/password',
  handler: profile.changePassword,
  options: {
    id: 'profile.changePassword',
    tags: ['api', 'profile'],
    validate: {
      payload: Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().custom(passwordValidJoiHandler).required()
      })
    },
    response: {
      schema: outputOkSchema(Joi.object()),
      failAction: 'log'
    }
  }
}, {
  method: 'PUT',
  path: `/${config.del.url}`,
  handler: profile.deleteUser,
  options: {
    auth: 'del',
    id: 'profile.delete',
    tags: ['api', 'profile'],
    validate: {
      payload: Joi.object({
        nickname: Joi.string().required()
      })
    }
  }
}, {
  method: 'GET',
  path: `${config.path.avatarURL}/{avatar}`,
  handler: profile.getAvatar,
  options: {
    auth: false,
    id: 'profile.avatar',
    tags: ['api', 'profile'],
    validate: {
      params: Joi.object({
        avatar: Joi.string().required()
      })
    }
  }
}, {
  method: 'POST',
  path: `/profile/me/documents`,
  handler: profile.uploadDocuments,
  options: {
    id: 'profile.documents.upload',
    tags: ['api', 'profile'],
    payload: {
      output: 'file',
      parse: true,
      maxBytes: 5242880,
      uploads: config.path.tempFolder
    }
  }
}, {
  method: 'DELETE',
  path: `/profile/me/documents`,
  handler: profile.deleteProfileDocument,
  options: {
    id: 'profile.documents.delete',
    tags: ['api', 'profile'],
    validate: {
      query: Joi.object({
        id: Joi.string()
      })
    }
  }
}, {
  method: 'GET',
  path: `/profile/me/documents`,
  handler: profile.getProfileDocumentList,
  options: {
    id: 'profile.documents.list',
    tags: ['api', 'profile']
  }
},
{
  method: 'PUT',
  path: `/profile/verify`,
  handler: profile.sendToVerify,
  options: {
    id: 'profile.send.ro.kyc',
    tags: ['api', 'profile']
  }
}, {
  method: 'POST',
  path: '/profile/form/person',
  handler: async (request, h) => profile.saveProfileVerificationInfo(request, { group: 'person' }),
  options: {
    description: 'Profile verification form Personal Info',
    notes: 'Profile verification form Personal Info',
    tags: ['api', 'REST'],
    validate: {
      payload: profilePersonalInfo
    }
  }
}, {
  method: 'POST',
  path: '/profile/form/document',
  handler: async (request, h) => profile.saveProfileVerificationInfo(request, { group: 'document' }),
  options: {
    description: 'Profile verification form Documents',
    notes: 'Profile verification form Documents',
    tags: ['api', 'REST'],
    validate: {
      payload: profileDocument
    }
  }
}, {
  method: 'POST',
  path: '/profile/form/communication',
  handler: async (request, h) => profile.saveProfileVerificationInfo(request, { group: 'communication' }),
  options: {
    description: 'Profile verification form Communication',
    notes: 'Profile verification form Communication',
    tags: ['api', 'REST'],
    payload: { maxBytes: 5242880 },
    validate: {
      payload: profileCommunication
    }
  }
}, {
  method: 'POST',
  path: '/profile/form/location',
  handler: async (request, h) => profile.saveProfileVerificationInfo(request, { group: 'location' }),
  options: {
    description: 'Profile verification form Location',
    notes: 'Profile verification form Location',
    tags: ['api', 'REST'],
    payload: { maxBytes: 8388608 },
    validate: {
      payload: profileLocation
    }
  }
}, {
  method: 'GET',
  path: '/profile/form/{group}',
  handler: profile.getProfileFormInfo,
  options: {
    description: 'Get profile form info',
    notes: 'Get profile form info',
    tags: ['api', 'REST'],
    validate: {
      params: Joi.object({
        group: Joi.string().valid('person', 'document', 'communication', 'location').required()
      })
    }
  }
}
];
