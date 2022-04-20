import {
  Table,
  Column,
  DataType,
  Model, BelongsTo, ForeignKey
} from 'sequelize-typescript';

import { PTBuilder } from '../services/Payments/PTBuilder';
import { CREATE_TRANSACTION } from '../services/Payments/actions';
import { ICreateTransaction } from '../services/Payments/interfaces';
import { WAITING_FOR_PAYMENTS } from '../services/Payments/statuses';
import { User } from './User';
import { getUUID } from '../utils';

@Table({ tableName: 'CpTransactions' })
export class CpTransaction extends Model<CpTransaction> {
    @Column({
      type: DataType.STRING,
      unique: true,
      primaryKey: true,
      autoIncrement: false,
      defaultValue: () => getUUID()
    }) id!: string;

    @ForeignKey(() => User)
    @Column({
      type: DataType.INTEGER,
      allowNull: false
    })
    userId: number;

    @Column({
      type: DataType.STRING,
      allowNull: true
    })
    txId: string;

    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    currency1: string;

    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    currency2: string;

    @Column({
      type: DataType.STRING,
      allowNull: true
    })
    address: string;

    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    buyerEmail: string;

    @Column({
      type: DataType.DECIMAL(20, 10),
      allowNull: false
    })
    currency1Amount: number;

    @Column({
      type: DataType.DECIMAL(20, 10),
      allowNull: false
    })
    currency2Amount: number;

    @Column({
      type: DataType.DECIMAL(20, 10),
      defaultValue: 0,
      allowNull: false
    })
    fee: number;

    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    status: string;

    @Column({
      type: DataType.STRING,
      allowNull: true
    })
    type: string;

    @Column({
      type: DataType.JSONB,
      allowNull: false,
      defaultValue: {}
    })
    options: string;

    @BelongsTo(() => User, {
      foreignKey: 'userId',
      targetKey: 'id'
    })
    user:User;

    static async createOrder(userId:string | number, orderOption: ICreateTransaction) {
      const payment = new PTBuilder();
      const resp = await payment[CREATE_TRANSACTION](orderOption);
      if (resp) {
        return this.create({
          userId,
          currency1: orderOption.currency1,
          currency2: orderOption.currency2,
          buyerEmail: orderOption.buyer_email,
          currency1Amount: orderOption.amount,
          currency2Amount: resp.amount,
          txId: resp.txn_id,
          address: resp.address,
          type: orderOption.type,
          status: WAITING_FOR_PAYMENTS,
          options: {
            statusUrl: resp.status_url,
            qrcodeUrl: resp.qrcode_url,
            timeout: resp.timeout,
            confirmsNeeded: resp.confirms_needed
          }
        });
      }

      return null;
    }
}
