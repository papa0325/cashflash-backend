import * as uuid from 'uuid/v4';
import { Boom } from '@hapi/boom';
import * as speakeasy from 'speakeasy';
import { randomBytes } from 'crypto';
import * as crypto from 'crypto';
import { Pool } from 'pg';
import * as fs from 'fs';
import config from '../config/config';

export const getUUID = () => uuid();

export const getRealIp = (request) => (request.headers['cf-connecting-ip']
  ? request.headers['cf-connecting-ip']
  : request.info.remoteAddress);

export const randomString = (len: number): string => randomBytes(len).toString('hex').slice(0, len);

export const output = (res: object) => ({
  ok: true,
  result: res
});

export const error = (code: number, msg: string, data: object) => new Boom(msg, {
  data: {
    code,
    data,
    custom: true
  },

  statusCode: Math.floor(code / 1000)
});

export const totpValidate = (totp: string, secret: string): boolean => speakeasy.totp.verify({
  secret,
  encoding: 'base32',
  token: Number(totp)
});

export const convertFromBase64 = (str: string) => // Определиться что будем передавать, base64 или base64url
  Buffer.from(str, 'base64');
export const round = (num: number, decimals: number): number => Math.floor(num * 10 ** decimals) / 10 ** decimals;

export const getDate = (startDate: Date = new Date(), offset: number) => new Date(Number(startDate) + offset);

export function validateAddress(address: string, type: string): boolean {
  switch (type) {
  case 'eth':
    return /^0x[a-fA-F0-9]{40}$/g.test(address);
  case 'btc':
    return /^[13][a-km-zA-HJ-NP-Z0-9]{26,33}$/igm.test(address);
  }
}

export function passwordValid(password: string): boolean {
  const
    space = /[\s]/.test(password);
  const checkSpecial = /[!@#$%^&*`()\[\]\{\}\\\|\/?<>:;.\-+='"~_]+/.test(password);
  const checkUpper = /[A-Z]+/.test(password);
  const checkLower = /[a-z]+/.test(password);
  return checkLower && checkUpper && checkSpecial && !space;
}

export function passwordValidJoiHandler(value, helpers) {
  if (!(passwordValid(value))) {
    return helpers.error('any.invalid');
  }

  return value;
}

export function checkMemo(memo: string, helpers) {
  if (!/^[a-z1-5]{12}$/g.test(memo)) {
    return helpers.error('any.invalid');
  }

  return memo;
}

export const addJob = async (taskName: string, payload?: any, options?: any) => {
  try {
    const pool = new Pool({ connectionString: config.scheduler.db });

    options = { ...{ max_attempts: 3 }, ...options };
    let query = `SELECT graphile_worker.add_job($1::text`;
    const values = [taskName];
    if (payload) {
      query += `, payload := $2`;
      values.push(JSON.stringify(payload));
    }

    if (options) {
      let c = values.length;
      ['queue_name', 'max_attempts', 'run_at', 'interval'].forEach((itm) => {
        if (options[itm]) {
          c++;
          if (itm === 'interval') {
            query += `, run_at := NOW() + ($${c} * INTERVAL '1 minute')`;
          }
          else {
            query += `, ${itm} :=$${c}`;
          }

          values.push(options[itm]);
        }
      });
    }

    query += ')';
    await pool.query(query, values);
    await pool.end();
  }
  catch (e) {
    console.log(e);
  }
};

export const groupByField = (dataArray: any[], field: string, options: { formatItemsFunction?, keyValueMode?: boolean } = {}) => {
  const {
    formatItemsFunction,
    keyValueMode
  } = options;
  return dataArray.reduce((obj: any, itm: any) => {
    if (!itm[field]) {
      return obj;
    }

    if (!obj[itm[field]]) {
      obj[itm[field]] = [];
    }

    if (formatItemsFunction && typeof formatItemsFunction === 'function') {
      itm = formatItemsFunction(itm);
    }

    if (keyValueMode) {
      obj[itm[field]] = itm;
    }
    else {
      obj[itm[field]].push(itm);
    }

    return obj;
  }, {});
};

export const deleteJob = async (taskName: string, payload?: any) => {
  try {
    const pool = new Pool({ connectionString: config.scheduler.db });
    await pool.query('DELETE FROM graphile_worker.jobs WHERE task_identifier=$1::text', [taskName]);
    await pool.end();
    return true;
  }
  catch (e) {
    console.log(e);
    return false;
  }
};

export const signature = (secret: string, algorithm: string, additionalString?: string) => {
  const crypt = crypto.createHmac(algorithm.toLocaleLowerCase(), secret);
  if (additionalString) {
    crypt.update(additionalString);
  }

  return crypt.digest('hex');
};

export const checkOrCreateStorageFolders = async () => {
  const foldersArray = [config.path.avatarFolder, config.path.documentsFolder, config.path.tempFolder];
  for (const i in foldersArray) {
    if (!await fs.existsSync(foldersArray[i])) {
      await fs.mkdirSync(foldersArray[i]);
      await fs.chmodSync(foldersArray[i], 0o777);
    }
  }
};

export const unlinkFiles = async (files) => {
  if (!Array.isArray(files)) {
    files = [files];
  }

  for (const i in files) {
    await fs.unlinkSync(files[i].path);
  }
};

export const arrayFlip = async (data: any) => {
  let key; const
    tmp_ar = {};
  for (key in data) {
    if (data.hasOwnProperty(key)) {
      tmp_ar[data[key]] = key;
    }
  }

  return tmp_ar;
};
