import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  HasOne,
  Model,
  Scopes,
  Table
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { getUUID } from '../utils';
import config from '../config/config';
import { Wallet } from './Wallet';
import { Session } from './Session';
import { Transaction } from './Transaction';
import { Notification } from './Notification';
import { Referral } from './Referral';

interface ISettings {
  confirmEmailToken: string;
  tmpPhoneNumber: string;
  confirmPhoneToken: string;

  totpToken: string;
  totpTempToken: string;

  restorePasswordToken: string;
  restorePasswordExpire: Date;
}

@Scopes(() => ({
  auth: {
    attributes: {
      include: ['settings', 'password']
    }
  }
}))
@Table({
  defaultScope: {
    attributes: {
      exclude: ['settings', 'password', 'createdAt', 'updatedAt']
    }
  }
})
export class User extends Model<User> {
  @Column({ type: DataType.STRING, primaryKey: true, defaultValue: () => getUUID() }) id!: string;

  @Column({ type: DataType.STRING, unique: true }) email: string;

  @Column({
    type: DataType.STRING,
    set(value: string) {
      const salt = bcrypt.genSaltSync(config.secure.saltRounds);
      const hash = bcrypt.hashSync(value, salt);
      this.setDataValue('password', hash);
    },
    get() {
      return this.getDataValue('password');
    }
  })
  password: string;

  @Column(DataType.TEXT) avatar: string;

  @Column(DataType.STRING) firstName: string;

  @Column(DataType.STRING) lastName: string;

  @Column(DataType.STRING) phone: string;

  @Column({ type: DataType.STRING, unique: true }) nickname: string;

  @Column({ type: DataType.JSONB, defaultValue: {} }) settings: ISettings;

  @Column({ type: DataType.INTEGER, defaultValue: 0 }) status: number; // 0 - created, 1 - email verified

  @Column({ type: DataType.STRING, unique: true }) refLink: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 }) verificationStatus: number; // 0 - no Date to Validate, 1 - sent to validate service, 2 - approved, -1 - failed

  @Column({ type: DataType.STRING, allowNull: true }) country: string;
  // @Column({
  //   type: DataType.STRING,
  //   unique:true,
  //   get(){
  //     return this.getDataValue(`memo`)
  //   },
  //   set(value){
  //     this.setDataValue(`memo`,value)
  //   },
  // }) nickname: string;

  async passwordCompare(pwd: string) {
    // Тут проблема с возвратом пароля, если его нет в defaultScope
    // @ts-ignore1
    const user = await this._modelOptions.sequelize.models.User.findByPk(this.id, {
      attributes: ['password']
    });
    return bcrypt.compareSync(pwd, user.password);
  }

  @HasMany(() => Wallet) wallets: Wallet[];

  @HasMany(() => Session, { onDelete: 'CASCADE' }) sessions: Session[];

  @HasMany(() => Transaction) txs: Transaction[];

  @HasMany(() => Notification, { onDelete: 'CASCADE' }) notifications: Notification[];

  @BelongsToMany(() => User, () => Referral, 'userId', 'refId') referrals: Referral[];
}
