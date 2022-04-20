import * as Joi from '@hapi/joi';
import config from '../../config/config';
import * as ipn from '../../api/public/ipn';

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

export default [{
  method: 'POST',
  path: `/ipn${config.gateway.key}`,
  handler: ipn.handle,
  options: {
    tags: ['api', 'ipn'],
    id: 'ipn.handler',
    auth: 'ipn'
    // validate: {
    //   payload: txInfo
    // }
  }
}];
