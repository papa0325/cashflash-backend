import * as Joi from '@hapi/joi';
import {
  getBalance,
  createTransaction,
  createWithdrawal, getTransactionInfo
} from '../../api/public/payments';

const txInfo = Joi.object({
  currency: Joi.string(),
  address: Joi.string(),
  amount: Joi.string(),
  tx_id: Joi.string(),
  status: Joi.number().integer(),
  isTokenTransferTx: Joi.boolean(),
  symbol: Joi.string(),
  contract_address: Joi.string(),
  decimals: Joi.number().integer()
});

const createTx = Joi.object({
  currency: Joi.string(),
  address: Joi.string(),
  amount: Joi.string(),
  tx_id: Joi.string(),
  status: Joi.number().integer(),
  isTokenTransferTx: Joi.boolean(),
  symbol: Joi.string(),
  contract_address: Joi.string(),
  decimals: Joi.number().integer()
});

export default [
  {
    method: 'GET',
    path: '/payments/transaction',
    handler: getTransactionInfo,
    options: {
      // validate: txInfo,
      description: 'Get transaction info',
      notes: 'Get transaction info',
      tags: ['api', 'payments'],
      auth: 'jwt-access'
    }
  }, {
    method: 'POST',
    path: '/payments/transaction',
    handler: createTransaction,
    options: {
      // validate: createTx,
      description: 'Transaction create',
      notes: 'Transaction create',
      tags: ['api', 'payments'],
      auth: 'jwt-access'
    }
  }, {
    method: 'POST',
    path: '/payments/withdrawal',
    handler: createWithdrawal,
    options: {
      // validate: createTx,
      description: 'Withdrawal create',
      notes: 'Withdrawal create',
      tags: ['api', 'payments'],
      auth: 'jwt-access'
    }
  }
];
