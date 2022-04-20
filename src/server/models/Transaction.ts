import {
  Model, Table, Column, DataType, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { getUUID } from '../utils';
import { Currency } from './Currency';
import { Wallet } from './Wallet';
import { User } from './User';

@Table({
  indexes: [{ fields: ['userId', 'walletId', 'currencyId'], using: 'BTREE' }]
})
export class Transaction extends Model<Transaction> {
  @Column({ type: DataType.STRING, defaultValue: () => getUUID(), primaryKey: true }) id!: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 }) status: number;

  @Column(DataType.BIGINT) amount: string;

  @Column(DataType.INTEGER) type: number; // 0 - deposit, 1 - withdraw

  @Column(DataType.STRING) to: string;

  @Column(DataType.STRING) description: string;

  @Column({ type: DataType.JSONB, defaultValue: {} }) meta: object;

  @ForeignKey(() => Currency) @Column(DataType.STRING) currencyId: string;

  @BelongsTo(() => Currency) currency: Currency;

  @ForeignKey(() => Wallet) @Column(DataType.STRING) walletId: string;

  @BelongsTo(() => Wallet) wallet: Wallet;

  @ForeignKey(() => User) @Column(DataType.STRING) userId: string;

  @BelongsTo(() => User) user: User;
}
