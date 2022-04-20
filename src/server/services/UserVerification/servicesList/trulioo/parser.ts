import { responses } from './schemes';

export class Parser {
  constructor(data?: any) {

  }

  static _requiredFieldParse(data: any, dictionary:any, deep = 0) {
    if (!deep) {
      deep++;
      return this._requiredFieldParse(data.properties, dictionary, deep);
    }

    const fields = new Object(null);
    let requiredFields = [];
    for (const n in data) {
      let itm = data[n];
      if (n === 'CountrySpecific' && Object.keys(itm.properties).length) {
        itm = Object.values(itm.properties)[0];
      }

      requiredFields = requiredFields.concat(itm.required);
      for (const i in itm.properties) {
        fields[i] = itm.properties[i];
      }
    }

    return { fields, requiredFields };
  }

  static restRequiredFields(data:any) {
    // let error = this.checkForErrors(data);
    // if(error)return error;

    return { raw: data, ...this._requiredFieldParse(data, responses.requiredFields) };
  }

  static prepareDataToVerify(data, scheme, requiredFields) {

  }
}
