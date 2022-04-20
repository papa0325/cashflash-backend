import { Currency } from '../models/Currency';

const currencies = [{
  id: 'CFT',
  fullTitle: 'CashFlash',
  decimals: 4,
  currentRate: '0'
}];

export async function init() {
  await Currency.bulkCreate(currencies);
}
