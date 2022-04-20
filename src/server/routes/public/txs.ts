import * as Joi from '@hapi/joi';
import * as txs from '../../api/public/txs';
import {
  TOKENID,
  EOSID
} from '../../utils/NumConverter/constants';

export default [{
  method: 'GET',
  path: '/profile/me/txs',
  handler: txs.list,
  options: {
    id: 'txs.list',
    tags: ['api', 'transactions'],
    validate: {
      query: Joi.object({
        limit: Joi.number().integer().default(10).min(0)
          .max(100),
        offset: Joi.number().integer().default(0).min(0)
      })
    }
  }
}, {
  method: 'GET',
  path: '/wallet/deposit',
  handler: txs.depositInfo,
  options: {
    id: 'txs.deposit.info',
    tags: ['api', 'transactions'],
    validate: {
      query: Joi.object({
        currency: Joi.string().required()
      })
    }
  }
}, {
  method: 'POST',
  path: '/wallet/withdraw',
  handler: txs.withdraw,
  options: {
    id: 'txs.withdraw',
    tags: ['api', 'transactions'],
    validate: {
      payload: Joi.object({
        amount: Joi.number().greater(0).required(),
        address: Joi.string().required(),
        memo: Joi.string(),
        currency: Joi.string().required(),
        internal: Joi.boolean().required()
      })
    }
  }
},
{
  method: 'GET',
  path: '/wallet/withdraw',
  handler: txs.withdrawalInfo,
  options: {
    id: 'txs.withdraw.info',
    tags: ['api', 'transactions'],
    validate: {
      query: Joi.object({
        currency: Joi.string().required()
      })
    }
  }
}
];
