/*eslint-disable*/
import * as Big from 'big-js';
import {
  error, output, totpValidate, validateAddress
} from '../../utils';
import { Wallet } from '../../models/Wallet';
import { Transaction } from '../../models/Transaction';
import { Currency } from '../../models/Currency';

export async function getAll(r) {
  return output({
    wallets: await Wallet.findAll({
      where: {
        userId: r.auth.credentials.id
      }
    })
  });
}

export async function getById(r) {
  const wallet = await Wallet.findByPk(r.params.walletId, {
    attributes: {
      include: [
        'userId'
      ]
    }
  });
  if (!wallet) {
    return error(404000, 'Wallet not found', { field: 'walletId' });
  }

  if (wallet.userId !== r.auth.credentials.id) {
    return error(404000, 'Wallet not found', { field: 'walletId' });
  }

  return output({ wallet });
}

export async function transactions(r) {
  const wallet = await Wallet.findByPk(r.params.walletId, {
    attributes: {
      include: [
        'userId'
      ]
    }
  });
  if (!wallet) {
    return error(404000, 'Wallet not found', { field: 'walletId' });
  }

  if (wallet.userId !== r.auth.credentials.id) {
    return error(404000, 'Wallet not found', { field: 'walletId' });
  }

  const transactions = await Transaction.findAndCountAll({
    where: {
      walletId: wallet.id
    },
    limit: r.query.limit,
    offset: r.query.offset
  });
  return output({ count: transactions.count, txs: transactions.rows });
}

export async function withdraw(r) {
  if (r.auth.credentials.settings.totpToken === null) {
    return error(400007, 'You have to activate totp before withdraw', {});
  }

  if (!totpValidate(r.payload.totp, r.auth.credentials.settings.totpToken)) {
    return error(400000, 'Totp invalid', { field: 'totp', reason: 'invalid' });
  }

  const wallet = await Wallet.findByPk(r.params.walletId, {
    attributes: {
      include: [
        'userId',
        'currencyId'
      ]
    }
  });
  if (!wallet) {
    return error(404000, 'Wallet not found', { field: 'walletId' });
  }

  if (wallet.userId !== r.auth.credentials.id) {
    return error(404000, 'Wallet not found', { field: 'walletId' });
  }

  const currency = await Currency.findByPk(wallet.currencyId, {
    attributes: {
      include: ['parentId', 'txLimits']
    }
  });
  if (currency.txLimits.minWithdraw) {
    if (Big(r.payload.amount).lt(Big(currency.txLimits.minWithdraw))) {
      return error(400007, 'Withdraw amount less than minimum', { minLimit: currency.txLimits.minWithdraw });
    }
  }

  const addressType = currency.parentId ? currency.parentId : currency.id;
  if (!validateAddress(r.payload.address, addressType)) {
    return error(400000, 'Invalid address', { field: 'address', reason: 'invalid' });
  }

  const amount = Big(r.payload.amount);
  let commission = Big(0);
  if (currency.txLimits.withdrawCommissionFixed) {
    commission = commission.plus(Big(currency.txLimits.withdrawCommissionFixed));
  }

  if (currency.txLimits.withdrawCommissionPercentage) {
    commission = commission.plus(amount.times(Big(currency.txLimits.withdrawCommissionPercentage).div(100000)));
  }

  const total = amount.plus(commission);
  if (Big(wallet.balance).cmp(total) === -1) {
    return error(400006, 'Insufficient balance', { commission: commission.toString() });
  }

  wallet.balance = Big(wallet.balance).minus(total).toString();
  await wallet.save();
  await r.server.app.scheduler.addJob('withdraw', {
    walletId: wallet.id,
    amount: r.payload.amount,
    address: r.payload.address,
    commission: commission.toString()
  });
  return output({});
}
