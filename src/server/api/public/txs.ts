/*eslint-disable*/
import { Transaction } from '../../models/Transaction';
import { addJob, error, output } from '../../utils';
import { Wallet } from '../../models/Wallet';
import { Currency } from '../../models/Currency';
import { DECIMALED, RATE } from '../../utils/NumConverter/actions';
import config from '../../config/config';
import { TX_COMPLETE } from '../../store/statuses';
import { User } from '../../models/User';
import { createAddress } from '../../utils/gateway';
import * as Big from 'big-js';

export async function list(r) {
  const res = await Transaction.findAndCountAll({
    where: {
      userId: r.auth.credentials.id
    },
    limit: r.query.limit || 5,
    offset: r.query.offset || 0,
    order: [['createdAt', 'DESC']]
  });
  const converter = await Currency.getConverter();

  res.rows = res.rows.map((tx) => {
    tx.amount = converter[DECIMALED](tx.amount, tx.currencyId).d.toString();
    return tx;
  });

  return output({ count: res.count, txs: res.rows });
}

export async function depositInfo(r) {
  const currencyId = r.query.currency.toLowerCase();
  const wallet = await Wallet.findOne({
    where: { userId: r.auth.credentials.id, currencyId }
  });

  if (!wallet) {
    return error(400000, 'Wallet not found', { field: 'wallet', reason: 'not found' });
  }

  return output({ memo: wallet.address, address: config.gateway.address });
}

export async function withdrawalInfo(r) {
  const currencyId = r.query.currency.toLowerCase();
  const wallet = await Wallet.findOne({
    where: { userId: r.auth.credentials.id, currencyId }
  });

  if (!wallet) {
    return error(400000, 'Wallet not found', { field: 'wallet', reason: 'not found' });
  }

  const converter = await Currency.getConverter();
  const BigLimit = converter[DECIMALED](wallet.balance, currencyId);

  return output({ limit: BigLimit.d.toString(), fee: 0.3 });
}

export async function withdraw(r) {
  const currencyId = r.payload.currency.toLowerCase();
  const wallet = await Wallet.findOne({
    where: { userId: r.auth.credentials.id, currencyId },
    include: ['currency']
  });
  if (!wallet) {
    return error(400000, 'Wallet not found', { field: 'wallet', reason: 'not found' });
  }

  if (wallet.address === r.payload.address) {
    return error(400000, 'The address is identical to the sender address', {
      field: 'address',
      reason: 'identical'
    });
  }

  const converter = await Currency.getConverter();

  const BigLimit = converter[DECIMALED](wallet.balance, currencyId);
  const BigAmount = converter[DECIMALED](r.payload.amount, currencyId);

  if (BigAmount.p.gt(BigLimit.n)) {
    return error(400000, 'Insufficient founds', { field: 'wallet', reason: 'insufficient founds' });
  }

  const withdrawData = {
    address: r.payload.address,
    amount: BigAmount.p.toString(),
    walletId: wallet.id,
    currencyId,
    userId: r.auth.credentials.id,
    type: 1,
    status: TX_COMPLETE,
    to: null,
    commission: 0,
    action: 'withdraw',
    memo: r.payload.memo
  };
  if (r.payload.internal) {
    const recipientAddress = await Wallet.findOne({
      where: { address: r.payload.address, currencyId }
    });

    if (!recipientAddress) {
      return error(400000, 'Recipient Wallet not found', { field: 'wallet', reason: 'not found' });
    }

    wallet.set({ balance: BigLimit.n.minus(BigAmount.p).toString() });
    await wallet.save();

    withdrawData.to = r.payload.address;
    withdrawData.action = 'transfer';
    await addJob('withdraw', withdrawData);
    // const BigRepBalance = converter[DECIMALED](recipientAddress.balance,currencyId);
    // recipientAddress.set({balance:BigRepBalance.n.plus(BigAmount.p).toString()});
    // await recipientAddress.save();
    //
    // await Transaction.create(withdrawData);
    // withdrawData.type = 0;
    // withdrawData.userId = recipientAddress.userId;
    // withdrawData.walletId = recipientAddress.id;
    // await Transaction.create(withdrawData);
  }
  else {
    withdrawData.commission = wallet.currency.txLimits.withdrawCommissionFixed;
    const newBalance = BigLimit.n.minus(BigAmount.p).minus(withdrawData.commission).toString(); 
    
    if (new Big(newBalance).lt(0)) {
      return error(400000, 'Insufficient founds', { field: 'wallet', reason: 'insufficient founds' });
    }

    wallet.set({ balance: newBalance });
    await wallet.save();
    await addJob('withdraw', withdrawData);
  }

  return output({ result: 'ok' });
}
