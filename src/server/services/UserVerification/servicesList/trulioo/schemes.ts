import {
  GET_COUNTRY_CODES,
  GET_CONSENTS,
  GET_RECOMMENDED_FIELDS,
  GET_TRANSACTION,
  VERIFY,
  GET_TEST_ENTITIES,
  GET_DETAILED_CONSENTS,
  GET_FIELDS,
  TEST_AUTHENTICATION,
  GET_DATASOURCE
} from './actions';

export const rest = {
  // AUTH

  [TEST_AUTHENTICATION]: {
    url: '/connection/v1/testauthentication',
    method: 'GET',
    defaultParams: {}
  },
  // CONFIGURATION
  [GET_FIELDS]: {
    url: '/configuration/v1/fields/{configurationName}/{countryCode}',
    method: 'GET',
    defaultParams: { configurationName: 'Identity Verification', countryCode: 'AU' }
  },
  [GET_RECOMMENDED_FIELDS]: {
    url: '/configuration/v1/recommendedfields/{configurationName}/{countryCode}',
    method: 'GET',
    defaultParams: { configurationName: 'Identity Verification', countryCode: 'AU' }
  },
  [GET_CONSENTS]: {
    url: '/configuration/v1/consents/{configurationName}/{countryCode}',
    method: 'GET',
    defaultParams: { configurationName: 'Identity Verification', countryCode: 'AU' }
  },
  [GET_DETAILED_CONSENTS]: {
    url: '/configuration/v1/detailedConsents/{configurationName}/{countryCode}',
    method: 'GET',
    defaultParams: { configurationName: 'Identity Verification', countryCode: 'AU' }
  },
  [GET_COUNTRY_CODES]: {
    url: '/configuration/v1/countrycodes/{configurationName}',
    method: 'GET',
    defaultParams: { configurationName: 'Identity Verification' }
  },
  [GET_COUNTRY_CODES]: {
    url: '/configuration/v1/countrycodes/{configurationName}',
    method: 'GET',
    defaultParams: { configurationName: 'Identity Verification' }
  },
  [GET_DATASOURCE]: {
    url: '/configuration/v1/datasources/{configurationName}/{countryCode}',
    method: 'GET',
    defaultParams: { configurationName: 'Identity Verification', countryCode: 'AU' }
  },

  // VERIFICATION
  [VERIFY]: {
    url: '/verifications/v1/verify',
    method: 'POST',
    defaultParams: {}
  },
  [GET_TRANSACTION]: {
    url: '/verifications/v1/transactionrecord/{id}',
    method: 'GET',
    defaultParams: { id: '0' }
  }
};
export const responses = {
  requiredFields: {
    required: 'requiredFields',
    DayOfBirth: 'dayOfBirth',
    MonthOfBirth: 'monthOfBirth',
    YearOfBirth: 'yearOfBirth',
    FirstGivenName: 'firstName',
    FirstSurName: 'lastName',
    MiddleName: 'middleName',
    PassportCountry: 'passportCountry',
    PassportNumber: 'identityDocumentNumber',
    MobileNumber: 'mobileTelephone',
    Telephone: 'telephone',
    BuildingNumber: 'buildingNum',
    UnitNumber: 'unitNumber',
    StreetName: 'streetName',
    StreetType: 'streetType',
    Suburb: 'city',
    StateProvinceCode: 'state',
    PostalCode: 'zip',
    title: 'title',
    type: 'type',
    properties: 'properties'
  }
};
