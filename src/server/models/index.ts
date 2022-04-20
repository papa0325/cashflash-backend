import { Sequelize } from 'sequelize-typescript';
import { Currency } from './Currency';
import { Notification } from './Notification';
import { RatesHistory } from './RatesHistory';
import { Referral } from './Referral';
import { Transaction } from './Transaction';
import { User } from './User';
import { Wallet } from './Wallet';
import { Session } from './Session';
import { CpTransaction } from './cp-transaction';
import { CpBalance } from './cp-balance';
import config from '../config/config';
import { Rewards } from './Rewards';
import { VerificationServices } from './VerificationServices';
import { VerificationFieldsInfo } from './VerificationFieldsInfo';
import { Countries } from './Countries';
import { PurchaseBonus } from './PurchaseBonus';
import { PurchaseHistory } from './PurchaseHistory';
import { ReferralStat } from './ReferralStat';

const sequelize = new Sequelize(config.db.link, {
  dialect: 'postgres',
  models: [
    Currency,
    Notification,
    RatesHistory,
    Referral,
    Session,
    Transaction,
    User,
    Wallet,
    CpTransaction,
    CpBalance,
    Rewards,
    VerificationServices,
    VerificationFieldsInfo,
    Countries,
    PurchaseBonus,
    PurchaseHistory,
    ReferralStat
  ],
  logging: false
});

sequelize.sync();

export default sequelize;
