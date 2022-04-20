import {
  Model, Column, Table, DataType, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { User } from './User';
import { Currency } from './Currency';
import { PurchaseBonus } from './PurchaseBonus';
@Table({
  tableName: 'PurchaseHistory',
  defaultScope: {
    include: [
      {
        model: PurchaseBonus,
        as: 'bonuses'
      }
    ]
  }
})
export class PurchaseHistory extends Model<PurchaseHistory> {
  @Column({ type: DataType.DATE }) date: Date;

  @Column(DataType.STRING) amount: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 }) bonusStatus: number; // 0 - нет бонуса, 1 - ождает, 2 - выплачено

  @ForeignKey(() => PurchaseBonus)
  @Column({ type: DataType.INTEGER, allowNull: true })
  bonusLevel: number;

  @BelongsTo(() => PurchaseBonus) bonuses: PurchaseBonus;

  @ForeignKey(() => User) @Column(DataType.STRING) userId: string;

  @BelongsTo(() => User) user: User;

  @ForeignKey(() => Currency) @Column(DataType.STRING) currencyId: string;

  @BelongsTo(() => Currency) currency: Currency;
}
