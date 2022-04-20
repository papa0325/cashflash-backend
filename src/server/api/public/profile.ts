/*eslint-disable*/
import * as fs from 'fs';
import * as Path from 'path';
import { unlinkSync } from 'fs';
import { verify } from 'crypto';
import * as Big from 'big-js';
import { User } from '../../models/User';
import {
  error, getUUID, output, randomString, signature, unlinkFiles
} from '../../utils';
import config from '../../config/config';
import { Wallet } from '../../models/Wallet';
import { Currency } from '../../models/Currency';
import { DECIMALED, RATE } from '../../utils/NumConverter/actions';
import {
  PROFILE_FROM_SIGNATURE, PROFILE_NEW_FORM, profileDocsFields, user
} from '../../schemes';
import { list } from '../../store/documents-mime-types';
import { VerificationServices } from '../../models/VerificationServices';
import { verifyUser, getCountries } from '../../utils/kyc-service';
import { VerificationFieldsInfo } from '../../models/VerificationFieldsInfo';
import profileScheme from '../../schemes/profile-form/form-validation-scheme';
import countries from '../../config/countries';

export const getMe = async (r) => {
  const user = await User.findByPk(r.auth.credentials.id, {
    include: [
      {
        model: Wallet
      }
    ],
    attributes: { include: ['settings'] }
  });

  const me = { ...user.dataValues };
  delete me.settings;

  if (me.avatar) {
    me.avatar = `${config.path.serverURL}${config.path.avatarURL}/${user.avatar}`;
  }

  // format wallet's amounts
  for (const i in user.wallets) {
    user.wallets[i].balance = new Big(user.wallets[i].balance).times(
      new Big(10).pow(-user.wallets[i].currency.decimals)
    );
    user.wallets[i].currency.currentRate = new Big(user.wallets[i].currency.currentRate).times(
      new Big(10).pow(-6)
    );
  }

  let profileIdentifyData = {};
  let profileVerificationErrors = {};

  if (user.settings.profileVerificationErrors) {
    profileVerificationErrors = user.settings.profileVerificationErrors;
  }

  me.countryCodes = await VerificationServices.getViableCountriesList();
  me.countryFields = {};

  let scheme = {};

  if (user.country) {
    const fieldsRecord = await VerificationFieldsInfo.findOne({
      where: { countryCode: 'GLOBAL_MULTI' },
      attributes: ['countryCode', 'fieldsInfo']
    });
    if (fieldsRecord) {
      me.countryFields = fieldsRecord.fieldsInfo;

      for (const category in me.countryFields) {
        scheme[category] = {}
        for (const field in me.countryFields[category].fields) {
          scheme[category][field] = "";
        }
      }

        if (user.settings[PROFILE_NEW_FORM]) {
          for (const i in scheme) {
            profileIdentifyData[i] = { ...scheme[i], ...user.settings[PROFILE_NEW_FORM][i] };
          }
        }
        else {
          profileIdentifyData = { ...scheme };
        }
    }
  }

  me.profileForm = profileIdentifyData;
  me.profileVerificationErrors = profileVerificationErrors;

  return output(me);
};

export const edit = async (r) => {
  try {
    const user = await User.findByPk(r.auth.credentials.id, {
      attributes: { include: ['settings'] }
    });
    const data = { ...r.payload };

    if (r.payload.username) {
      if (await User.findOne({ where: { username: r.payload.username } })) {
        return error(400000, 'Username is already in use', { field: 'username', reason: 'used' });
      }
    }

    const docFields = Object.keys(profileDocsFields);
    const profileIdentifyData: any = {};

    for (const i in data) {
      if (docFields.indexOf(i) !== -1) {
        profileIdentifyData[i] = data[i];
        delete data[i];
      }
    }

    // const profileSignature = signature('4rKBHYPVGQcKUzkpPZGMsGrwQuZ82va3mYWQNUnk6wt', 'SHA256', JSON.stringify(profileIdentifyData));

    // if (!user.settings.profileSignature || user.settings.profileSignature !== profileSignature) {
    // const vBuilder = new UserVerificationBuilder(`trulioo`);
    // await vBuilder[VERIFY](profileIdentifyData);

    user.set({
      // 'settings.profileSignature': profileSignature,
      'settings.profileNewData': profileIdentifyData,
      // 'settings.profileWaitingForApproveBy': profileSignature,
      'settings.profileVerificationErrors': [],
      status: 1
    });

    await user.save();
    // }

    if (r.payload.avatar) {
      const filename = `${randomString(30)}.jpg`;
      if (user.avatar && (await fs.existsSync(`${config.path.avatarFolder}/${user.avatar}`))) {
        await fs.unlinkSync(`${config.path.avatarFolder}/${user.avatar}`);
      }

      fs.writeFileSync(
        `${config.path.avatarFolder}/${filename}`,
        r.payload.avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''),
        {
          encoding: 'base64',
          mode: 0o777
        }
      );
      data.avatar = filename;
    }

    await user.update(data);
    return output({});
  }
  catch (e) {
    console.log(e);
  }
};

export const changePassword = async (r) => {
  const user = await User.findByPk(r.auth.credentials.id);

  if (!(await user.passwordCompare(r.payload.oldPassword))) {
    return error(400000, 'Old password is invalid', { field: 'old_password', reason: 'invalid' });
  }

  user.set({ password: r.payload.newPassword });
  await user.save();
  return output({});
};

export const deleteUser = async (r) => {
  try {
    const user = await User.findOne({
      where: {
        nickname: r.payload.nickname
      }
    });
    if (!user) {
      return error(400000, 'User not found', { field: 'nickname', reason: 'invalid' });
    }

    await user.destroy({
      logging: true
    });
    return output({ success: 'ok' });
  }
  catch (e) {
    console.log(e);
  }
};

export const getAvatar = async (r, h) => {
  try {
    if (!(await fs.existsSync(`${config.path.avatarFolder}/${r.params.avatar}`))) {
      return error(400004, 'avatar not found', {});
    }

    return await h.file(`${config.path.avatarFolder}/${r.params.avatar}`);
  }
  catch (e) {
    console.log(e);
  }
};

export const uploadDocuments = async (r, h) => {
  const files: any = Object.values(r.payload);
  try {
    const user = await User.findByPk(r.auth.credentials.id, {
      attributes: { include: ['settings'] }
    });
    let toSaveDocs = [];
    if (user.settings.profileIdentifyDocuments) {
      const dCount = user.settings.profileIdentifyDocuments.length;
      if (dCount === 2) {
        await unlinkFiles(files);
        return error(400000, 'you got 2 documents uploaded', {});
      }

      if (2 - dCount < Object.keys(r.payload).length) {
        await unlinkFiles(files);
        return error(400000, `you can upload only ${2 - dCount} more document`, {});
      }

      toSaveDocs = user.settings.profileIdentifyDocuments;
    }

    const userPath = Path.join(config.path.documentsFolder, user.id);
    if (!(await fs.existsSync(userPath))) {
      await fs.mkdirSync(userPath, { mode: 0o777 });
    }

    const resp = [];

    for (const i in files) {
      if (list.indexOf(files[i].headers['content-type']) === -1) {
        await unlinkFiles(files);
        return error(400000, `document type not allowed`, {});
      }
    }

    for (const i in files) {
      const file = files[i];

      const fileObj = {
        fileName: getUUID(),
        fileOriginName: file.filename,
        type: file.headers['content-type'],
        bytes: file.bytes
      };
      await fs.writeFileSync(Path.join(userPath, fileObj.fileName), fs.readFileSync(file.path));
      resp.push({
        docId: fileObj.fileName,
        originalName: fileObj.fileOriginName,
        type: file.headers['content-type']
      });
      await unlinkSync(file.path);
      toSaveDocs.push(fileObj);
    }

    // user.set({'settings.profileIdentifyDocuments': toSaveDocs});
    await User.update(
      { 'settings.profileIdentifyDocuments': toSaveDocs },
      { where: { id: r.auth.credentials.id } }
    );

    return output(resp);
  }
  catch (e) {
    await unlinkSync(files);
    console.log(e);
  }
};

export const getProfileDocumentList = async (r, h) => {
  try {
    const user = await User.findByPk(r.auth.credentials.id, {
      attributes: { include: ['settings'] }
    });
    if (!user.settings.profileIdentifyDocuments) {
      return output([]);
    }

    const respArray = [];
    for (const i in user.settings.profileIdentifyDocuments) {
      const resObj = {
        docId: user.settings.profileIdentifyDocuments[i].fileName,
        originalName: user.settings.profileIdentifyDocuments[i].fileOriginName,
        type: user.settings.profileIdentifyDocuments[i].type
      };
      respArray.push(resObj);
    }

    return output(respArray);
  }
  catch (e) {
    console.log(e);
  }
};

export const deleteProfileDocument = async (r, h) => {
  try {
    const file = r.query.id;
    const user = await User.findByPk(r.auth.credentials.id, {
      attributes: { include: ['settings'] }
    });
    if (!user.settings.profileIdentifyDocuments) {
      return error(400000, `you have no documents yet`, {});
    }

    const userDocPath = Path.join(config.path.documentsFolder, r.auth.credentials.id);
    for (const i in user.settings.profileIdentifyDocuments) {
      const { settings } = user;
      const d = user.settings.profileIdentifyDocuments[i];
      const filePath = Path.join(userDocPath, file);
      if (d.fileName === file) {
        if ((await fs.existsSync(userDocPath)) && (await fs.existsSync(filePath))) {
          await fs.unlinkSync(filePath);
        }

        settings.profileIdentifyDocuments.splice(parseInt(i), 1);
        user.set({ 'settings.profileIdentifyDocuments': settings.profileIdentifyDocuments });

        await User.update(
          { 'settings.profileIdentifyDocuments': settings.profileIdentifyDocuments },
          { where: { id: r.auth.credentials.id } }
        );

        return output({ success: true });
      }
    }

    return error(400000, `document not found`, {});
  }
  catch (e) {
    console.log(e);
  }
};

export const getCountryList = async (r, h) => {
  return output(getCountries());
};

export const getCountryFields = async (r, h) => {
  try {
    const fields = await VerificationFieldsInfo.findOne({
      where: { countryCode: r.params.country },
      attributes: ['countryCode', 'fieldsInfo']
    });
    if (!fields) {
      return {};
    }

    return output(fields.fieldsInfo);
  }
  catch (e) {
    console.log(e);
  }
};

export const sendToVerify = async (r, h) => {
  try {
    const u = await User.findByPk(r.auth.credentials.id, {
      attributes: ['id', 'settings', 'country']
    });
    if (!u.settings[PROFILE_NEW_FORM] || !Object.keys(u.settings[PROFILE_NEW_FORM]).length) {
      return error(400000, `User profile credentials is empty`, {});
    }

    const profileSignature = signature(
      config.profileVerification.secret,
      'SHA256',
      JSON.stringify(u.settings[PROFILE_NEW_FORM])
    );

    const verifyPayload = {
      userModel: u,
      userData: u.settings[PROFILE_NEW_FORM],
      userDataSignature: profileSignature
    };
    const result = await verifyUser(verifyPayload);

    if (!result.error) {
      if (result.verified) {
        u.set({verificationStatus: 2})
        await u.save();
        return output(result);
      }

      return error(400000, 'Invalid data', result);
    }

    return error(400000, 'Invalid data', {});
  }
  catch (e) {
    return error(500000, `internal server error`, {});
  }
};

export const saveProfileVerificationInfo = async (r, options) => {
  try {
    const { group } = options;
    const user = await User.findByPk(r.auth.credentials.id, {
      attributes: { include: ['settings'] }
    });
    if (!user.settings.profileForm) {
      user.set({ [`settings.${PROFILE_NEW_FORM}`]: {} });
    }

    user.set({ [`settings.${PROFILE_NEW_FORM}.${group}`]: r.payload });
    await user.save();

    return output({ success: true });
  }
  catch (e) {
    console.log(e);
    return error(500000, `internal server error`, {});
  }
};

export const getProfileFormInfo = async (r) => {
  try {
    const { group } = r.params;
    const user = await User.findByPk(r.auth.credentials.id, {
      attributes: { include: ['settings'] }
    });
    if (!user.settings[PROFILE_NEW_FORM] || !user.settings[PROFILE_NEW_FORM][group]) {
      return output({});
    }

    return output(user.settings.profileForm[group]);
  }
  catch (e) {
    console.log(e);
    return error(500000, `internal server error`, {});
  }
};
