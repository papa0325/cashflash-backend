/*eslint-disable*/
import * as speakeasy from 'speakeasy';
import { Op } from 'sequelize';
import { User } from '../../models/User';
import { Session } from '../../models/Session';
import {
  error, getDate, getRealIp, output, randomString, totpValidate
} from '../../utils';
import { generateJwt } from '../../utils/auth';
import config from '../../config/config';
import { Referral } from '../../models/Referral';
import { ReferralStat } from '../../models/ReferralStat';
import { VerificationServices } from '../../models/VerificationServices';
import { PROFILE_NEW_FORM } from '../../schemes';

export const login = async (r) => {
  const user = await User.scope('auth').findOne({ where: { email: r.payload.email } });
  if (!user) {
    return error(401000, 'Incorrect email and password pair', {});
  }

  if (!(await user.passwordCompare(r.payload.password))) {
    return error(401000, 'Incorrect email and password pair', {});
  }

  if (user.settings.totpToken) {
    if (r.payload.totp) {
      if (!totpValidate(r.payload.totp, user.settings.totpToken)) {
        return error(400000, 'Totp invalid', { field: 'totp', reason: 'invalid' });
      }
    }
    else {
      return error(400000, 'Totp required', { field: 'totp', reason: 'required' });
    }
  }

  const session = await Session.create({
    userId: user.id,
    lastUsedDate: new Date(),
    lastUsedIp: getRealIp(r)
  });

  return output({ ...generateJwt({ id: session.id }), status: user.status });
};

export const register = async (r) => {
  try {
    const userRegistered = await User.scope('auth').findOne({
      where: {
        [Op.or]: [{ email: r.payload.email }, { nickname: r.payload.nickname }]
      }
    });

    if (userRegistered) {
      if (userRegistered.email === r.payload.email) {
        if (userRegistered.status !== 0) {
          return error(400000, 'Email is already in use', { field: 'email', reason: 'used' });
        }

        await userRegistered.destroy();
      }
      else {
        return error(400000, 'Nickname must be unique', { field: 'nickname', reason: 'unique' });
      }
    }

    const user = await User.create(r.payload);

    user.set({
      [`settings.${PROFILE_NEW_FORM}`]: {
        person: {
          lastName: r.payload.lastName,
          firstName: r.payload.firstName
        },
        communication: {
          email: r.payload.email
        }
      }
    });

    const session = await Session.create({
      userId: user.id,
      lastUsedDate: new Date(),
      lastUsedIp: getRealIp(r)
    });

    const token = randomString(6).toUpperCase();
    const refLink = randomString(16);

    await r.server.app.scheduler.addJob('sendEmail', {
      email: user.email,
      subject: 'CashFlash verification',
      template: 'cf_welcome',
      data: {
        code: token
      }
    });

    user.set({ 'settings.confirmEmailToken': token, refLink });
    if (r.payload.ref) {
      const referrerUser = await User.findOne({
        where: { refLink: r.payload.ref }
      });
      console.log('referrer', referrerUser);

      if (referrerUser) {
        await Referral.create({ userId: referrerUser.id, refId: user.id });
      }
    }

    await user.save();

    return output(generateJwt({ id: session.id }));
  }
  catch (e) {
    console.log(e);
  }
};

export const enableTotp = async (r) => {
  const user = await User.scope('auth').findByPk(r.auth.credentials.id);
  if (user.settings.totpToken) {
    return error(400002, 'Totp enabled already', {});
  }

  user.set({
    'settings.totpTempToken': speakeasy.generateSecret({ length: 10, name: 'CashFlash Platform' })
      .base32
  });
  await user.save();

  return output({ tempTotp: user.settings.totpTempToken });
};

export const validateTotp = async (r) => {
  const user = await User.scope('auth').findByPk(r.auth.credentials.id);

  if (user.settings.totpTempToken == null) {
    return error(400001, 'Enable totp first', {});
  }

  if (!(await user.passwordCompare(r.payload.password))) {
    return error(400000, 'Password invalid', { field: 'password', reason: 'invalid' });
  }

  if (totpValidate(r.payload.totp, user.settings.totpTempToken)) {
    user.set({
      'settings.totpToken': user.settings.totpTempToken,
      'settings.totpTempToken': null
    });
    await user.save();
    return output({});
  }

  return error(400000, 'Totp invalid', { field: 'totp', reason: 'invalid' });
};

export const disableTotp = async (r) => {
  const user = await User.scope('auth').findByPk(r.auth.credentials.id);

  if (user.settings.totpToken == null) {
    return error(400003, 'Totp disabled already', {});
  }

  if (!(await user.passwordCompare(r.payload.password))) {
    return error(400000, 'Password invalid', { field: 'password', reason: 'invalid' });
  }

  if (totpValidate(r.payload.totp, user.settings.totpToken)) {
    user.set({ 'settings.totpToken': null });

    await user.save();
    return output({});
  }

  return error(400000, 'Totp invalid', { field: 'totp', reason: 'invalid' });
};

export const sendValidateMessage = async (r) => {
  if (!r.auth.credentials.settings.confirmEmailToken) {
    return error(400005, 'Email is already verified', {});
  }

  await r.server.app.scheduler.addJob('sendEmail', {
    email: r.auth.credentials.email,
    text: `Your CashFlash verification code is ${r.auth.credentials.settings.confirmEmailToken}`,
    subject: 'CashFlash verification',
    html: `<p>Your CashFlash verification code is ${r.auth.credentials.settings.confirmEmailToken}</p>`
  });

  return output({});
};

export const validateEmail = async (r) => {
  const user = await User.scope('auth').findByPk(r.auth.credentials.id);

  if (user.settings.confirmEmailToken !== r.payload.code) {
    return error(400000, 'Code invalid', { field: 'code', reason: 'invalid' });
  }

  user.set({ 'settings.confirmEmailToken': null });
  await Referral.approveReferral(user.id);
  await ReferralStat.create({ userId: user.id });
  user.status = 1;
  await user.save();
  await r.server.app.scheduler.addJob('createWallet', {
    userId: user.id,
    currency: 'tnt',
    memo: user.nickname
  });

  return output({});
};

export const getTempTotp = async (r) => output({
  token: r.auth.credentials.settings ? r.auth.credentials.settings.totpTempToken : null
});

export const isTotpEnabled = async (r) => output({ enabled: !!r.auth.credentials.settings.totpToken });

export const refreshToken = async (r) => output(generateJwt({ id: r.auth.artifacts.session }));

export const restoreSendCode = async (r) => {
  const user = await User.findOne({
    where: { email: r.payload.email },
    attributes: { include: ['settings'] }
  });
  if (!user) {
    return error(404000, 'User not found', { field: 'email', type: 'invalid' });
  }

  user.set({
    'settings.restorePasswordToken': randomString(10).toUpperCase(),
    'settings.restorePasswordExpire': getDate(new Date(), 60000 * config.expire.restorePassword)
  });
  await user.save();
  await r.server.app.scheduler.addJob('sendEmail', {
    text: `Your CashFlash restoration code is ${user.settings.restorePasswordToken}`,
    email: user.email,
    subject: 'CashFlash | Restoration code',
    html: `<html xmlns="http://www.w3.org/1999/html">
      <body>
        <a href="${
  `${config.path.appURL
  }/reset?email=${
    encodeURIComponent(user.email)
  }&code=${
    user.settings.restorePasswordToken}`
}">
          Click here to restore your password
        </a>
        </br>
        Code will expire in ${config.expire.restorePassword} minutes
      </body>
    </html>`
  });
  return output({});
};

export async function restorePassword(r) {
  const user = await User.findOne({
    where: { email: r.payload.email },
    attributes: { include: ['settings'] }
  });
  if (!user) {
    return error(404000, 'User not found', { field: 'email', reason: 'invalid' });
  }

  if (user.settings.restorePasswordToken !== r.payload.restoreCode) {
    return error(404000, 'Invalid restoration code', { field: 'restoreCode', reason: 'invalid' });
  }

  if (new Date(user.settings.restorePasswordExpire) < new Date()) {
    return error(400000, 'Restoration code expired. Please request new.', {
      field: 'restoreCode',
      reason: 'expired'
    });
  }

  user.set({ 'settings.restorePasswordToken': null, 'settings.restorePasswordExpire': null });
  user.password = r.payload.password;
  await user.save();

  return output({});
}

export async function getCountryList(r) {
  return output(await VerificationServices.getViableCountriesList());
}
