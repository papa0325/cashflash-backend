import {
  CREATE_TRANSFER,
  CREATE_TRANSACTION,
  CREATE_WITHDRAWAL,
  GET_TRANSACTION_INFO,
  GET_WITHDRAWAL_INFO,
  GET_CALLBACK_ADDRESS,
  GET_DEPOSIT_ADDRESS,
  GET_TRANSACTION_LIST
} from './actions';

export interface ICreateTransfer{
    amount:number,
    currency:string,
    merchant?:string,
    pbntag?:string,
    auto_confirm?:1|0,
}

export interface ICreateWithdrawal{
    amount:number,
    currency:string,
    add_tx_fee?:0|1,
    address:string,
    auto_confirm?:1|0,
    ipn_url?:string,
    note?:string,
}

export interface ICreateTransaction{
    amount?:number,
    currency1:string,
    currency2:string,
    buyer_email:string,
    address?:string,
    buyer_name ?:string,
    item_name ?:string,
    item_number?:string|number,
    invoice?:string,
    custom?:string,
    ipn_url?:string,
    type?:string,
}

export interface ITransactionResp {
    amount:number,
    address:string,
    confirms_needed:string | number,
    timeout:number,
    status_url :string,
    qrcode_url :string,
}

export interface IPTBuilder {
    [CREATE_TRANSFER](options:ICreateTransfer): any,
    [CREATE_TRANSACTION](options:ICreateTransaction):ITransactionResp,
    [CREATE_WITHDRAWAL](options:ICreateWithdrawal): any,
    [GET_TRANSACTION_INFO](): any,
    [GET_WITHDRAWAL_INFO](): any,
    [GET_CALLBACK_ADDRESS](): any,
    [GET_DEPOSIT_ADDRESS](): any,
    [GET_TRANSACTION_LIST](): any,
}
