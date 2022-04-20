import { User } from '../../models/User';
import { output } from '../../utils';
import {
  PROFILE_FROM_VERIFIED_BY,
  PROFILE_FROM_SIGNATURE,
  PROFILE_VERIFICATION_SERVICE_RAW_RESPONSE,
  PROFILE_VERIFIED_FORM
} from '../../schemes';

export async function income(r) {
  try {
    const { query, payload } = r;
    const user = await User.findByPk(query.u, {
      attributes: { include: ['settings'] }
    });
    if (
      user.settings[PROFILE_FROM_SIGNATURE]
      && user.settings[PROFILE_FROM_SIGNATURE] === query.s
    ) {
      user.set({
        verificationStatus: payload.verified == true ? 2 : -1,
        status: payload.verified == true ? 2 : 1,
        [`settings.${PROFILE_VERIFICATION_SERVICE_RAW_RESPONSE}`]: payload.data,
        [`settings.${PROFILE_FROM_VERIFIED_BY}`]: payload.provider,
        [`settings.${PROFILE_VERIFIED_FORM}`]: user.settings[PROFILE_VERIFIED_FORM]
      });

      await user.save();
    }

    return output({});
  }
  catch (e) {
    console.log(e);
  }
}
