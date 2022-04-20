import * as handlers from '../../api/hooks/kyc-service';
import { kycServiceHook } from '../../schemes';
import config from '../../config/config';

export default [{
  method: 'POST',
  path: config.webHooks.kycHookUrl,
  handler: handlers.income,
  options: {
    id: 'webhooks.kys',
    tags: ['api', 'webhooks'],
    validate: {
      query: kycServiceHook
    },
    auth: false
  }
}];
