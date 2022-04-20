import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from 'sequelize-typescript';
import { getUUID } from '../utils';
import { User } from './User';
import { Currency } from './Currency';
import { Transaction } from './Transaction';

export interface IGreetingBonus {
  amount: number;
  until: Date;
}

export interface IWalletSettings {
  greetingBonus?: IGreetingBonus;
}

@Table({
  defaultScope: {
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'currencyId']
    },
    include: [
      {
        model: Currency,
        as: 'currency'
      }
    ]
  },
  indexes: [{ fields: ['address'] }]
})
export class Wallet extends Model<Wallet> {
  @Column({
    type: DataType.STRING, primaryKey: true, unique: true, defaultValue: () => getUUID()
  })
  id!: string;

  @Column(DataType.STRING) balance!: string;

  @ForeignKey(() => User) @Column(DataType.STRING) userId: string;

  @BelongsTo(() => User) user!: User;

  @ForeignKey(() => Currency) @Column(DataType.STRING) currencyId: string;

  @BelongsTo(() => Currency) currency!: Currency;

  @Column({ type: DataType.JSONB, defaultValue: {} }) settings: IWalletSettings;

  @Column(DataType.STRING) address!: string;

  @HasMany(() => Transaction) transactions: Transaction[];
}
