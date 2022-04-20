import { PTBuilder } from '../../services/Payments/PTBuilder';
import {
  CREATE_TRANSACTION,
  CREATE_WITHDRAWAL,
  GET_TRANSACTION_INFO, GET_WITHDRAWAL_INFO
} from '../../services/Payments/actions';
import { CpTransaction } from '../../models/cp-transaction';

const payment = new PTBuilder();

export const getBalance = async (request, h) => {

};

export const createTransaction = async (request, h) => {
  const resp = await payment[CREATE_TRANSACTION](request.payload);
  await CpTransaction;
};

export const createWithdrawal = async (request, h) => {
  await payment[CREATE_WITHDRAWAL](request.payload);
};

export const getWithdrawalInfo = async (request, h) => {
  await payment[GET_WITHDRAWAL_INFO]();
};

export const getTransactionInfo = async (request, h) => {
  await payment[GET_TRANSACTION_INFO]();
};
