import auth from './auth';
import profile from './profile';
import payments from './payments';
import ipn from './ipn';
import wallet from './wallet';
import txs from './txs';
import currency from './currency';
import ref from './refferal';
import purchase from './purchase';

export default [
  ...auth,
  ...profile,
  // ...payments,
  ...ipn,
  // ...wallet,
  ...txs,
  ...ref,
  ...currency,
  ...purchase
];
