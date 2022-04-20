import * as Joi from '@hapi/joi';
import * as handlers from '../../api/public/purchase';

export default [
  {
    method: 'GET',
    path: '/purchase/bonuses',
    handler: handlers.getPurchaseBonuses,
    options: {
      description: 'Get purchase bonuses',
      notes: 'Get purchase bonuses',
      tags: ['api', 'purchase'],
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/purchase/my-bonuses',
    handler: handlers.getMyBonuses,
    options: {
      description: 'Get my bonuses',
      notes: 'Get my bonuses',
      tags: ['api', 'purchase']
    }
  },
  {
    method: 'POST',
    path: '/purchase/buy-cft',
    handler: handlers.buyCFT,
    options: {
      id: 'purchase.buyCFT',
      tags: ['api', 'purchase'],
      description: 'Buy cft',
      notes: 'Buy cft',
      validate: {
        payload: Joi.object({
          amount: Joi.number().greater(0).required()
        })
      }
    }
  }
];
