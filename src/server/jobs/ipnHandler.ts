import * as Big from 'big-js';
import { Op } from 'sequelize';
import { Transaction } from '../models/Transaction';
import { Wallet } from '../models/Wallet';
import { Currency } from '../models/Currency';
import { TX_COMPLETE, TX_FAILED } from '../store/statuses';

interface IHandlerIPN {
  tx_id: string;
  currency: string;
  address: string;
  amount: string;
  status: number;
  isTokenTransferTx: boolean;
  symbol: string;
  contract_address: string;
  decimals: number;
}

export default async (payload: IHandlerIPN) => {
  console.log('Start Job');
  const wallet = await Wallet.findOne({
    where: {
      address: payload.address,
      currencyId: payload.isTokenTransferTx ? payload.symbol : payload.currency
    },
    attributes: {
      include: ['userId', 'settings']
    }
  });
  if (!wallet) {
    console.log('No wallet found');
    return;
  }

  let tx = await Transaction.findOne({
    where: {
      'meta.tx_id': payload.tx_id
    }
  });

  const currency = await Currency.findByPk(payload.isTokenTransferTx ? payload.symbol : payload.currency);
  if (!currency) {
    console.log('No currency found');
    return;
  }

  if (wallet.currency.id !== currency.id) {
    console.log('Currency id != Wallet currency id');
    return;
  }

  if (!tx) {
    tx = await Transaction.create({
      status: payload.status,
      amount: Big(payload.amount).toString(),
      type: 0,
      meta: {
        tx_id: payload.tx_id
      },
      currencyId: currency.id,
      walletId: wallet.id,
      userId: wallet.userId
    });
  }

  // tx.status = payload.status < 2 ? payload.status : -1;
  await tx.save();

  // TODO: greeting bonus handle

  // Plus balance if successful deposit  or unsuccessful withdraw
  if ((tx.status === TX_COMPLETE && tx.type === 0) || tx.status === TX_FAILED && tx.type === 1) {
    wallet.balance = Big(wallet.balance).plus(Big(payload.amount)).toString();
    await wallet.save();
  }
};
