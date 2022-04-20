import {
  Table,
  Column,
  DataType,
  Model, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { User } from './User';
import { getUUID } from '../utils';

@Table({ tableName: 'CpBalance' })
export class CpBalance extends Model<CpBalance> {
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
      type: DataType.DECIMAL(20, 10),
      allowNull: false,
      defaultValue: 0
    })
    amount: number;

    @Column({
      type: DataType.INTEGER,
      allowNull: false,
      defaultValue: 1
    })
    status: number;

    @BelongsTo(() => User, {
      foreignKey: 'userId',
      targetKey: 'id'
    })
    user:User;

    static async createNewAcc(userId) {
      return this.create({ userId });
    }
}
