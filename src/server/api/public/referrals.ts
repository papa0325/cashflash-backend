import * as Big from 'big-js';
import { output, error, addJob } from '../../utils';
import { ReferralStat } from '../../models/ReferralStat';
import { User } from '../../models/User';

export const getRefInfo = async (r, h) => {
  try {
    const user = await User.findOne({
      where: { id: r.auth.credentials.id }
    });
    const userRefStat = await ReferralStat.findByPk(r.auth.credentials.id);
    const amount = new Big(userRefStat.bonusAmount)
      .times(new Big(10).pow(-userRefStat.currency.decimals))
      .toFixed();

    return output({
      currency: userRefStat.currencyId,
      amount,
      refLink: user.refLink,
      usersCount: userRefStat.refCount,
      invitationCount: userRefStat.invitationCount
    });
  }
  catch (e) {
    return error(500000, 'Internal server error', {});
  }
};

export const sendRefInvitation = async (r, h) => {
  try {
    const user = await User.findByPk(r.auth.credentials.id);
    const userRefStat = await ReferralStat.findByPk(r.auth.credentials.id);

    let text = `${r.payload.text}\n` || `You have been invited to CashFlash by ${user.email}\n`;
    text += `Fallow the link: ${r.payload.refLink}`;
    await addJob('sendEmail', {
      text,
      email: r.payload.email,
      subject: 'CashFlash | Invitation'
      // html: ``
    });
    userRefStat.set({ invitationCount: userRefStat.invitationCount + 1 });
    await userRefStat.save();
    return output({ success: true });
  }
  catch (e) {
    return error(500000, 'Internal server error', {});
  }
};
