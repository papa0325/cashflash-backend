import { output } from '../../utils';

export const handle = async (r) => {
  r.server.log('IPN', r.payload);
  console.log('IPN', r.payload);
  await r.server.app.scheduler.addJob('ipnHandler', r.payload);
  return output({});
};
