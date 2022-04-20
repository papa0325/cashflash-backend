import * as dotenv from 'dotenv';
import * as Path from 'path';

dotenv.config();

export default {
  db: {
    link: process.env.DB_LINK
  },
  auth: {
    jwt: {
      access: {
        secret: process.env.JWT_ACCESS_SECRET,
        lifetime: Number(process.env.JWT_ACCESS_LIFETIME)
      },
      refresh: {
        secret: process.env.JWT_REFRESH_SECRET,
        lifetime: Number(process.env.JWT_REFRESH_LIFETIME)
      }
    }
  },
  cors: {
    origins: JSON.parse(process.env.CORS_ORIGINS),
    methods: JSON.parse(process.env.CORS_METHODS)
  },
  secure: {
    saltRounds: Number(process.env.SALT_ROUNDS)
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD
  },
  scheduler: {
    db: process.env.SCHEDULER_LINK,
    concurrency: Number(process.env.SCHEDULER_CONCURRENCY),
    interval: Number(process.env.SCHEDULER_INTERVAL)
  },
  path: {
    avatarURL: process.env.AVATAR_URL,
    serverURL: process.env.SERVER_URL,
    appURL: process.env.APP_URL,
    documentsFolder: Path.join(__dirname, '..', '..', '..', process.env.DOCUMENTS_FOLDER),
    tempFolder: Path.join(__dirname, '..', '..', '..', process.env.TEMP_UPLOADS_FOLDER),
    avatarFolder: Path.join(__dirname, '..', '..', '..', process.env.AVATAR_FOLDER)
  },
  gateway: {
    url: process.env.GATEWAY_URL,
    username: process.env.GATEWAY_USERNAME,
    password: process.env.GATEWAY_PASSWORD,
    key: process.env.GATEWAY_IPN,
    otp: process.env.GATEWAY_2FA_KEY,
    serverId: process.env.GATEWAY_SERVER_ID,
    serverPassword: process.env.GATEWAY_SERVER_PASSWORD,
    address: process.env.GATEWAY_TXS_ADDRESS,
    issuerTokensAddress: 'issuercftacc' // TODO add to .env
  },
  rates: {
    apiKey: process.env.COIN_MARKET_API_KEY,
    precision: Number(process.env.RATES_PRECISION),
    cftToEurRates: 1 // process.env.CFT_EUR_RATIO,
  },
  expire: {
    restorePassword: Number(process.env.RESTORE_PASSWORD_EXPIRE)
  },
  del: {
    url: process.env.DELETE_URL,
    login: process.env.DELETE_LOGIN,
    password: process.env.DELETE_PASS
  },
  webHooks: {
    kycPathToken: process.env.KYC_WEBHOOK_AUTH_TOKEN,
    kycHookUrl: `/${process.env.KYC_WEBHOOK_AUTH_TOKEN}kyc_hook`
  },
  kycService: {
    baseUrl: process.env.KYC_BASE_URL,
    accessToken: process.env.KYC_ACCESS_TOKEN
  },
  defaultCurrencies: ['eos', 'tnt'],
  profileVerification: {
    secret: process.env.PROFILE_VERIFICATION_PAYLOAD_SIGN_SECRET
  }
};
