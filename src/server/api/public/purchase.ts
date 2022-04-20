/*eslint-disable*/
import { addJob, error, output } from '../../utils';
import { PurchaseBonus } from '../../models/PurchaseBonus';
import { PurchaseHistory } from '../../models/PurchaseHistory';
import { Wallet } from '../../models/Wallet';
import * as Big from 'big-js';
import { Currency } from '../../models/Currency';
import { Op } from 'sequelize';
import { MAIN_CURRENCY, TOKEN, EUR } from '../../store/constants/default-currencies';
Big.RM = 0;

const getWalletByTicker = async (userId, currencyId) => {
  return await Wallet.findOne({
    where: {
      userId,
      currencyId,
    },
  });
};

const getRatesForPurchase = async () => {
  try {
    const rates = await Currency.findAll({
      where: {
        [Op.or]: [{ id: MAIN_CURRENCY }, { id: TOKEN }, { id: EUR }],
      },
    });

    const ratesFormatted = {};
    rates.forEach((item) => {
      ratesFormatted[item.id] = item.currentRate;
    });

    return ratesFormatted;
  } catch (e) {
    console.log(e);
  }
};

export const getPurchaseBonuses = async (request, h) => {
  let bonuses = await PurchaseBonus.findAll({ raw: true });

  // all bonuses are considered relative to the same currency
  const curr = await Currency.findOne({ where: { id: bonuses[0].currencyId } });

  bonuses = bonuses.map((item) => {
    const itemWithFormattedAmonunt = item;
    itemWithFormattedAmonunt.minAmount = new Big(item.minAmount).times(
      new Big(10).pow(-curr.decimals)
    );
    itemWithFormattedAmonunt.maxAmount = new Big(item.maxAmount).times(
      new Big(10).pow(-curr.decimals)
    );
    return item;
  });

  return output(bonuses);
};

export const buyCFT = async (request, h) => {
  const reqAmount = new Big(request.payload.amount).times(new Big(10).pow(6));

  const user = request.auth.credentials;

  const walletEos = await getWalletByTicker(user.id, MAIN_CURRENCY);
  const walletCft = await getWalletByTicker(user.id, TOKEN);

  if (walletEos && new Big(walletEos.balance).gt(0)) {
    const rates = await getRatesForPurchase();

    const neededAmount = reqAmount
      .div(rates[TOKEN])
      .times(rates[MAIN_CURRENCY])
      .times(new Big(10).pow(walletEos.currency.decimals - 6));

    if (neededAmount.gt(walletEos.balance)) {
      return error(400000, 'Insufficient funds', {});
    }

    Big.RM = 3;
    const amountEos = neededAmount.toFixed(0);
    Big.RM = 0;

    const amountCft = reqAmount.times(new Big(10).pow(walletCft.currency.decimals - 6)).toFixed(0);

    await addJob('purchaseCft', {
      walletEosId: walletEos.id,
      walletCftId: walletCft.id,
      from: user.nickname,
      amountEos,
      amountCft,
      rates,
    });
  } else {
    return error(400000, 'Insufficient funds', {});
  }

  return output({ status: 'ok' });
};

export const getMyBonuses = async (request, h) => {
  const user = request.auth.credentials;
  const purchases = await PurchaseHistory.findAll({
    where: {
      userId: user.id,
      bonusStatus: 1,
    },
  });
  const bonuses = [];
  if (purchases.length) {
    const curr = await Currency.findOne({ where: { id: TOKEN } });
    const days = 90;
    const duration = 86400 * 1000 * days;

    for (let item of purchases) {
      const reward = new Big(item.amount).times(new Big(item.bonuses.reward).div(100)).toFixed(0);

      if (reward) {
        bonuses.push({
          paymentDate: new Date(new Date(item.date).getTime() + duration),
          reward: new Big(reward).times(new Big(10).pow(-curr.decimals)),
          currencyId: curr.id,
        });
      }
    }
  }

  return output({ bonuses });
};
