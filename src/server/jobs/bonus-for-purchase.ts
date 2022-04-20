/*eslint-disable*/
import * as Big from 'big-js';
import { Op } from 'sequelize';
import config from '../config/config';
import { getDate } from '../utils';
import { PurchaseHistory } from '../models/PurchaseHistory';
import { deleteJob } from '../utils/helpers';
import { TOKEN, MAIN_CURRENCY } from '../store/constants/default-currencies';
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { TX_COMPLETE, TX_FAILED, TX_PENDING } from '../store/statuses';
import { withdraw } from '../utils/gateway';

export default async (p, h) => {
  try {
    await deleteJob('bonus-for-purchase');

    // const days = 90;
    // const duration = 86400 * 1000 * days;

    const duration = 60 * 10 * 1000; // 10 min // TODO change on prodaction
    const checkDate = new Date().getTime() - duration;

    const checkPurchases = await PurchaseHistory.findAll({
      where: {
        date: { [Op.lte]: checkDate },
        bonusStatus: 1
      }
    });

    if (checkPurchases.length) {
      for (const item of checkPurchases) {
        const wallet = await Wallet.findOne({
          where: {
            userId: item.userId,
            currencyId: TOKEN
          }
        });

        const reward = new Big(item.amount).times(new Big(item.bonuses.reward).div(100)).toFixed(0);

        if (reward) {
          const tx = await Transaction.create({
            status: TX_PENDING,
            amount: reward,
            userId: wallet.userId,
            walletId: wallet.id,
            currencyId: TOKEN,
            type: 0,
            to: wallet.address,
            description: 'Bonus for purchase'
          });

          const transferData = {
            from: config.gateway.issuerTokensAddress,
            to: wallet.address,
            amount: reward,
            currency: MAIN_CURRENCY,
            id: tx.id,
            tokenTransfer: true,
            symbol: TOKEN,
            action: 'transfer'
          };

          try {
            const res = await withdraw(
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
            item.set({ bonusStatus: 2 });

            await item.save();
            await wallet.save();
            tx.set({ status: TX_COMPLETE });
          }
          catch (e) {
            tx.set({ status: TX_FAILED });
            console.log(e);
          }
          finally {
            await tx.save();
          }
        }
      }
    }

    // const jobDuration = 43200 * 1000; // 12h
    const jobDuration = 60 * 5 * 1000; // 5 min // TODO change on prodation

    await h.addJob('bonus-for-purchase', {}, { runAt: getDate(new Date(), jobDuration) });
  }
  catch (e) {
    console.log(e);
  }
};
