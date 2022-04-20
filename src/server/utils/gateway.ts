/*eslint-disable*/
import axios from 'axios';
import * as Speakeasy from 'speakeasy';
import config from '../config/config';

const base64data = Buffer.from(`${config.gateway.username}:${config.gateway.password}`).toString(
  'base64'
);

const getOTP = () => Speakeasy.totp({
  secret: config.gateway.otp,
  encoding: 'base32'
});

const toUrlParams = (params: object) => Object.keys(params)
  .map((name) => `${name}=${encodeURIComponent(params[name])}`)
  .join('&');

interface ICreateAddress {
  currency: string;
  memo: string;
}

export const createAddress = async (data: ICreateAddress) => {
  const res = await axios.get(
    `${config.gateway.url}/address?currency=${data.currency}&address=${data.memo}`,
    {
      headers: {
        'content-type': 'application/json',
        Authorization: `Basic ${base64data}`
      }
    }
  );
  return res.data;
};

interface IGetBalance {
  address: string;
  currency: string;
}

export const getBalance = async (data: IGetBalance) => {
  const res = await axios.get(
    `${config.gateway.url}/address-info?currency=${data.currency}&address=${data.address}`,
    {
      headers: {
        'content-type': 'application/json',
        Authorization: `Basic ${base64data}`
      }
    }
  );
  return res.data.balance;
};

export async function withdraw(
  from: string,
  to: string,
  amount: string,
  currency: string,
  id: string,
  tokenTransfer: boolean,
  symbol: string,
  action?: string,
  memo?: string
) {
  const otp = getOTP();
  let str = `/${action || 'withdraw'}?from=${from}&to=${to}&amount=${amount}&currency=${encodeURI(
    currency
  )}&id=${id}&isTokenTransferTx=${tokenTransfer}&memo=${memo}`;
  if (tokenTransfer) {
    str += `&symbol=${encodeURI(symbol)}`;
  }

  const res = await axios.get(config.gateway.url + str, {
    headers: {
      Authorization: `Basic ${base64data}`,
      otp
    }
  });
  return res.data;
}

interface IBuyToken {
  id: string;
  from: string;
  amountEos: string;
  amountCft: string;
}

export async function buyToken(data: IBuyToken) {
  const otp = getOTP();
  const queryParams = toUrlParams(data);

  const query = `${config.gateway.url}/buytoken?${queryParams}`;
  const res = await axios.get(query, {
    headers: {
      Authorization: `Basic ${base64data}`,
      otp
    }
  });

  return res.data;
}
