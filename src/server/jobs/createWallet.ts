import * as Big from 'big-js';
import { Currency } from '../models/Currency';
import { createAddress } from '../utils/gateway';
import { IWalletSettings, Wallet } from '../models/Wallet';
import { getDate } from '../utils';
import { DECIMALED } from '../utils/NumConverter/actions';

interface ICreateWalletJob {
  userId: string;
  currency: string;
  memo: string;
}

export default async (payload: ICreateWalletJob) => {
  try {
    const currency = await Currency.findByPk(payload.currency, {
      attributes: {
        include: ['parentId', 'meta']
      }
    });

    const address = await createAddress({
      currency: currency.parentId ? currency.parentId : currency.id,
      memo: payload.memo
    });

    // let initBalance = currency.meta.greetingBonus ? Big(currency.meta.greetingBonus).toString() : '0';
    const initBalance = '0';

    const initSettings: IWalletSettings = {};
    // if (currency.meta.greetingBonus) {
    //   initSettings.greetingBonus = {
    //     amount: currency.meta.greetingBonus,
    //     until: getDate(new Date(), currency.meta.greetingBonus.dateOffset)
    //   };
    // }
    const newWallets = [payload.currency, 'eos', 'cft'].map((currency) => ({
      userId: payload.userId,
      balance: initBalance,
      currencyId: currency,
      address,
      settings: initSettings
    }));
    await Wallet.bulkCreate(newWallets);
  }
  catch (e) {
    console.log(e);
  }
};
