import {
  Model, Column, Table, DataType, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { Currency } from './Currency';

@Table({
  tableName: 'PurchaseBonus',
  timestamps: false,
  defaultScope: {
    attributes: {
      exclude: ['id']
    }
  }
})
export class PurchaseBonus extends Model<PurchaseBonus> {
    @Column({ type: DataType.INTEGER }) level: number;

    @ForeignKey(() => Currency)
    @Column({ type: DataType.STRING }) currencyId: string;

    @Column({ type: DataType.STRING }) minAmount: string;

    @Column({ type: DataType.STRING }) maxAmount: string;

    @Column({ type: DataType.STRING }) reward: string;

    @BelongsTo(() => Currency, 'currencyId') currency:Currency;
}
