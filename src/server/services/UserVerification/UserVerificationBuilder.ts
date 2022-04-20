import * as api from './servicesList/index';
import {
  GET_COUNTRY_CODES, GET_RECOMMENDED_FIELDS, VERIFY, VERIFY_FIELDS
} from '../../store/verification-service-actions';

// import {exchangeConstructorBuilder,IRestRequester,IRestRequesterConstructorArguments} from '../interfaces'

export class UserVerificationBuilder {
    _serviceName: string | null = null;

    _requestParameters: any = { attributes: {} };

    _builder: any;

    constructor(serviceName: string) {
      if (!serviceName || !api[serviceName]) {
        return null;
      }

      const { Builder } = api[serviceName];
      this._builder = new Builder();
    }

    [GET_COUNTRY_CODES](urlAttributes?:any) {
      if (!this._builder || !this._builder[GET_COUNTRY_CODES]) {
        return null;
      }

      return this._builder[GET_COUNTRY_CODES](urlAttributes);
    }

    [GET_RECOMMENDED_FIELDS](urlAttributes?:any) {
      if (!this._builder || !this._builder[GET_RECOMMENDED_FIELDS]) {
        return null;
      }

      return this._builder[GET_RECOMMENDED_FIELDS](urlAttributes);
    }

    [VERIFY](payload: any, urlAttributes?:any) {
      if (!this._builder || !this._builder[VERIFY]) {
        return null;
      }

      return this._builder[VERIFY](payload, urlAttributes);
    }

    [VERIFY_FIELDS](payload: any) {
      if (!this._builder || !this._builder[VERIFY]) {
        return null;
      }
    }
}
