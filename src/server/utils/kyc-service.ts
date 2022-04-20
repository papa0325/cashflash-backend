/*eslint-disable*/
import axios from 'axios';
import config from '../config/config';
import countries from '../config/countries';

import { User } from '../models/User';
import { error, output } from './index';
import {
  PROFILE_FROM_VERIFIED_BY,
  PROFILE_FROM_SIGNATURE,
  PROFILE_VERIFICATION_SERVICE_RAW_RESPONSE,
  PROFILE_VERIFIED_FORM
} from '../schemes';

const base64data = Buffer.from(`${config.gateway.username}:${config.gateway.password}`).toString(
  'base64'
);

interface IVerifyUserPayload {
  userData: object;
  userDataSignature: string;
  userModel: User;
}

export const verifyUser = async (data: IVerifyUserPayload) => {

  const removeEmpty = (obj) => {
    Object.keys(obj).forEach(key =>
      (obj[key] && typeof obj[key] === 'object') && removeEmpty(obj[key]) ||
      (obj[key] === undefined || obj[key] === null || obj[key] === "") && delete obj[key]
    );
    return obj;
  };

  const userData = removeEmpty(data.userData);

  const paylaod = {
    country: data.userModel.country,
    ...userData
  };

  try {
    const resp = await axios.post(`${config.kycService.baseUrl}/w2/global/global_multi`, paylaod);
    const respData = resp.data;

    const user = data.userModel;

    user.set({
      verificationStatus: respData.verified == true ? 2 : -1,
      status: respData.verified == true ? 2 : 1,
      [`settings.${PROFILE_FROM_VERIFIED_BY}`]: respData.provider,
      [`settings.${PROFILE_VERIFIED_FORM}`]: respData.userData
    });

    await user.save();
    return { verified: respData.verified, data: respData.data };
  }
  catch (e) {
    return { error: true };
  }
};

export const getCountries = () => {
  return countries;
};

export const getCountyFields = async (countryCode: string) => {
  try {
    const res = await axios.get(`${config.kycService.baseUrl}/w2/fields/${countryCode}`, {});
    return res.data.result;
  }
  catch (e) {
    // console.log(e)
    return {};
  }
};
