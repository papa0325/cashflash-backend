/*eslint-disable*/
import * as Big from 'big-js';
import { Wallet } from '../models/Wallet';
import { Currency } from '../models/Currency';
import { Transaction } from '../models/Transaction';
import { withdraw } from '../utils/gateway';
import { TX_COMPLETE, TX_FAILED, TX_PENDING } from '../store/statuses';

interface IWithdrawJob {
  address: string;
  walletId: string;
  amount: string;
  commission: string;
  action?: string;
  memo?: string;
}

export default async function (payload: IWithdrawJob) {
  const amount = Big(payload.amount);
  const wallet = await Wallet.findByPk(payload.walletId, {
    attributes: {
      include: ['currencyId', 'userId']
    }
  });

  const currency = await Currency.findByPk(wallet.currencyId, {
    attributes: {
      include: ['parentId']
    }
  });
  const currencyType = currency.parentId ? currency.parentId : currency.id;
  const isTokenTransfer = !!currency.parentId;
  const tx = await Transaction.create({
    status: TX_PENDING,
    amount: payload.amount.toString(),
    userId: wallet.userId,
    walletId: wallet.id,
    currencyId: wallet.currencyId,
    type: 1,
    to: payload.address
  });
  const commission = Big(payload.commission || 0);

  try {
    const res = await withdraw(wallet.address, payload.address, payload.amount, currencyType, tx.id, isTokenTransfer, currency.id, payload.action, payload.memo);
    console.log('----- res', res);
    if (payload.action === 'withdraw') {
      tx.set({
        'meta.tx_id': res[0].tx_id, 'meta.fee': res[0].fee, 'meta.commission': commission.toString()
      });
    }
    else {
      const recepientWallet = await Wallet.findOne({
        where: { address: payload.address, currencyId: wallet.currencyId }
      });
      if (recepientWallet) {
        await Transaction.create({
          status: TX_COMPLETE,
          amount: payload.amount.toString(),
          userId: recepientWallet.userId,
          walletId: recepientWallet.id,
          currencyId: wallet.currencyId,
          type: 0,
          to: payload.address
        });

        recepientWallet.set({ balance: Big(recepientWallet.balance).plus(payload.amount).toString() });
        await recepientWallet.save();
      }
    }
    
    tx.set({ status: TX_COMPLETE });
    await tx.save();
  }
  catch (e) {
    tx.set({ status: TX_FAILED });
    await tx.save();

    wallet.balance = Big(wallet.balance).plus(amount.plus(commission)).toString();
    await wallet.save();

    console.log('WITHDRAW ERROR---', e);
  }
}
