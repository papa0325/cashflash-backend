import Coinpayments from 'coinpayments';
import { privateKey, publicKey } from '../../config/coin-payments';
import {
  CREATE_TRANSFER,
  CREATE_TRANSACTION,
  CREATE_WITHDRAWAL,
  GET_TRANSACTION_INFO,
  GET_WITHDRAWAL_INFO,
  GET_CALLBACK_ADDRESS,
  GET_DEPOSIT_ADDRESS,
  GET_TRANSACTION_LIST,
  GET_RATES
} from './actions';
import { IPTBuilder, ICreateTransfer } from './interfaces';

export class PTBuilder implements IPTBuilder {
    _paymentBuilder;

    _paymentOptions: {key:string, secret:string};

    constructor() {
      this._paymentOptions = { key: publicKey, secret: privateKey };
      this._paymentBuilder = new Coinpayments(this._paymentOptions);
    }

    public async [CREATE_TRANSFER](options:ICreateTransfer) {
      return this._paymentBuilder.createTransfer(options);
    }

    public [CREATE_TRANSACTION](options) {
      return this._paymentBuilder.createTransaction(options);
    }

    public [CREATE_WITHDRAWAL](options) {
      return this._paymentBuilder.createTransfer(options);
    }

    public [GET_TRANSACTION_INFO]() {

    }

    public [GET_WITHDRAWAL_INFO]() {

    }

    public [GET_DEPOSIT_ADDRESS]() {

    }

    public [GET_CALLBACK_ADDRESS]() {

    }

    public [GET_TRANSACTION_LIST]() {

    }

    public async [GET_RATES]() {
      return this._paymentBuilder.rates({ accepted: 1 });
    }
}
