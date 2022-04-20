/*eslint-disable*/
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { PurchaseHistory } from '../models/PurchaseHistory';
import { PurchaseBonus } from '../models/PurchaseBonus';
import { Op } from 'sequelize';

import { buyToken, withdraw } from '../utils/gateway';
import { TX_COMPLETE, TX_FAILED, TX_PENDING } from '../store/statuses';
import * as Big from 'big-js';
import { EUR, TOKEN, MAIN_CURRENCY } from '../store/constants/default-currencies';
import config from '../config/config';

import { Referral } from '../models/Referral';
import { ReferralStat } from '../models/ReferralStat';
import { user } from '../schemes';

interface IBuyToken {
  walletEosId: string;
  walletCftId: string;
  from: string;
  amountEos: string;
  amountCft: string;
  rates: object;
}

const REFERRER_BONUS_PERCENT = 10;

async function bonusToReferrer(refId, amount) {
  const reward = new Big(amount).times(new Big(REFERRER_BONUS_PERCENT).div(100)).toFixed(0);

  const refRecord = await Referral.findOne({
    where: {
      refId,
    },
  });

  if (refRecord && reward && reward !== '0') {
    const wallet = await Wallet.findOne({
      where: {
        userId: refRecord.userId,
      },
    });

    const referrerStat = await ReferralStat.findOne({
      where: {
        userId: wallet.userId,
      },
    });

    const tx = await Transaction.create({
      status: TX_PENDING,
      amount: reward,
      userId: wallet.userId,
      walletId: wallet.id,
      currencyId: TOKEN,
      type: 0,
      to: wallet.address,
      description: 'Bonus for referral',
    });

    const transferData = {
      from: config.gateway.issuerTokensAddress,
      to: wallet.address,
      amount: reward,
      currency: MAIN_CURRENCY,
      id: tx.id,
      tokenTransfer: true,
      symbol: TOKEN,
      action: 'transfer',
    };

    try {
      let res = await withdraw(
        transferData.from,
        transferData.to,
        transferData.amount,
        transferData.currency,
        transferData.id,
        transferData.tokenTransfer,
        transferData.symbol,
        transferData.action
      );

      wallet.set({ balance: new Big(wallet.balance).plus(transferData.amount).toFixed() });
      wallet.save();

      tx.set({ status: TX_COMPLETE });
      console.log(`----- bonus for referral to ${transferData.to} : ${transferData.amount}`);
      referrerStat.set({
        bonusAmount: new Big(referrerStat.bonusAmount).plus(transferData.amount).toFixed(0),
      });
      await referrerStat.save();
    } catch (e) {
      console.log(e);
      tx.set({ status: TX_FAILED });
      console.log(
        `[FAILED] ----- bonus for referral to ${transferData.to} : ${transferData.amount}`
      );
    } finally {
      await tx.save();
    }
  }
}

export default async function (data: IBuyToken) {
  const walletEos = await Wallet.findByPk(data.walletEosId);
  const walletCft = await Wallet.findByPk(data.walletCftId);

  const txEos = await Transaction.create({
    status: TX_PENDING,
    amount: data.amountEos,
    userId: walletEos.userId,
    walletId: walletEos.id,
    currencyId: walletEos.currency.id,
    type: 1,
    to: data.from,
    description: 'Purchase CFT',
  });

  const txCft = await Transaction.create({
    status: TX_PENDING,
    amount: data.amountCft,
    userId: walletCft.userId,
    walletId: walletCft.id,
    currencyId: walletCft.currency.id,
    type: 0,
    to: data.from,
    description: 'Purchase CFT',
  });

  try {
    const _data = {
      id: txEos.id,
      from: data.from,
      amountEos: data.amountEos,
      amountCft: data.amountCft,
    };
    console.log('----- buy payload', _data);

    const res = await buyToken(_data);

    console.log('----- buy resp', res);

    walletEos.set({ balance: new Big(walletEos.balance).minus(_data.amountEos).toFixed() });
    walletCft.set({ balance: new Big(walletCft.balance).plus(_data.amountCft).toFixed() });

    await walletEos.save();
    await walletCft.save();

    const currentDate = new Date().setHours(0, 0, 0, 0);

    let purchase = await PurchaseHistory.findOne({
      where: {
        userId: walletCft.userId,
        date: currentDate,
        bonusStatus: {
          [Op.ne]: 2,
        },
      },
    });

    if (!purchase) {
      purchase = await PurchaseHistory.create({
        userId: walletCft.userId,
        date: currentDate,
        amount: data.amountCft,
        currencyId: walletCft.currency.id,
      });
    } else {
      const newAmount = new Big(purchase.amount).plus(data.amountCft);
      purchase.set({
        amount: newAmount.toFixed(),
      });
    }

    const bonuses = await PurchaseBonus.findAll({ raw: true });
    const amountEur = new Big(new Big(purchase.amount + '00')
      .times(data.rates[TOKEN])
      .div(data.rates[EUR])
      .times(new Big(10).pow(-4)).toFixed(0));

    let bonusLevel = null;
    for (let bonus of bonuses) {
      if (amountEur.gte(bonus.minAmount) && amountEur.lte(bonus.maxAmount)) {
        bonusLevel = bonus.level;
        break;
      }
    }

    if (bonusLevel) {
      purchase.set({ bonusLevel, bonusStatus: 1 });
    }

    await purchase.save();

    txEos.set({ status: TX_COMPLETE });
    txCft.set({ status: TX_COMPLETE });
  } catch (e) {
    txEos.set({ status: TX_FAILED });
    txCft.set({ status: TX_FAILED });
    console.log('CONVERT ERROR---', e);
  } finally {
    await txEos.save();
    await txCft.save();
  }

  // начисление бонусов реферреру
  await bonusToReferrer(walletEos.userId, data.amountCft);
}
