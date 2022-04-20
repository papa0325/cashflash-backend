/*eslint-disable*/
import { VerificationServices } from '../models/VerificationServices';
import { VerificationFieldsInfo } from '../models/VerificationFieldsInfo';
import { getCountyFields } from '../utils/kyc-service';

export default async function (p, h) {
  try {
    const country = 'GLOBAL_MULTI';
    const service = await VerificationServices.findOne({
      where: { name: 'w2' }
    });
    if (!service) {
      return false;
    }

    const { fields, required } = await getCountyFields(country);
    
    if (fields) {
      const newData = {
        fieldsInfo: fields,
        rawFieldsInfo: {},
        requiredFields: required
      };
      const exists = await VerificationFieldsInfo.findOne({
        where: {
          vServiceId: service.id,
          countryCode: country
        }
      });

      if (!exists) {
        await VerificationFieldsInfo.create({
          vServiceId: service.id, countryCode: country, ...newData
        });
      }
      else {
        exists.set(newData);
        await exists.save();
      }
    }
  }
  catch (e) {
    console.log(e);
  }
  // let currentDate = new Date();
  // currentDate.setMinutes(currentDate.getMinutes() + 2);
  // await addJob('ref-reward-enroll', p, {run_at: currentDate});
}
