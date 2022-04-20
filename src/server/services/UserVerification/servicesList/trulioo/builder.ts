import axios from 'axios';
import { authHeader, apiKey, baseUrl } from '../../../../config/trulioo';
import {
  GET_COUNTRY_CODES,
  GET_CONSENTS,
  GET_RECOMMENDED_FIELDS,
  GET_TRANSACTION,
  VERIFY,
  GET_TEST_ENTITIES,
  GET_DETAILED_CONSENTS,
  GET_FIELDS,
  TEST_AUTHENTICATION
} from './actions';
import { rest } from './schemes';
import { Parser } from './parser';
import { VERIFY_FIELDS } from '../../../../store/verification-service-actions';

export class Builder {
    _header:string;

    _apiKey:string;

    _baseUrl:string;

    _parser:any;

    constructor() {
      this._apiKey = apiKey;
      this._header = authHeader;
      this._baseUrl = baseUrl;
      this._parser = Parser;
    }

    public async [GET_RECOMMENDED_FIELDS](requestAttributes?) {
      const options = rest[GET_RECOMMENDED_FIELDS];
      let urlParams = options.defaultParams;
      if (requestAttributes) {
        urlParams = { ...urlParams, ...requestAttributes };
      }

      const res = await this._requester(this._urlBuilder(options.url, urlParams), options.method);
      if (res) {
        return this._parse(res, 'restRequiredFields');
      }

      return res;
    }

    public async [GET_COUNTRY_CODES](payload, requestAttributes?) {
      const options = rest[GET_COUNTRY_CODES];
      let urlParams = options.defaultParams;
      if (requestAttributes) {
        urlParams = { ...urlParams, ...requestAttributes };
      }

      return await this._requester(this._urlBuilder(options.url, urlParams), options.method, payload);
    }

    public async [VERIFY](payload, requestAttributes?) {
      this[VERIFY_FIELDS](VERIFY);
      const options = rest[GET_COUNTRY_CODES];
      let urlParams = options.defaultParams;
      if (requestAttributes) {
        urlParams = { ...urlParams, ...requestAttributes };
      }

      return await this._requester(this._urlBuilder(options.url, urlParams), options.method, payload);
    }

    private _urlBuilder(url, payload) {
      const regEx = /\{(\w+)\}/ig;
      if (url.match(regEx)) {
        url = url.replace(regEx, (match, p1) => payload[p1]);
      }

      url = `${this._baseUrl}${url}`;

      return url;
    }

    private async _requester(url, method, payload?:any) {
      const headers = { 'x-trulioo-api-key': this._apiKey };
      try {
        const opts: any = {
          url,
          method,
          headers
        };
        if (payload) {
          opts.data = payload;
        }

        const { data } = await axios(opts);
        return data;
      }
      catch (e) {
        // console.log(e)
        return null;
      }
    }

    private async [VERIFY_FIELDS](payload) {

    }

    private _parse(data, action) {
      if (!this._parser || !this._parser[action]) {
        return null;
      }

      return this._parser[action](data);
    }
}
