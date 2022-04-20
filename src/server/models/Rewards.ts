import {
  Model, Column, Table, DataType, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { getUUID } from '../utils';

import { Currency } from './Currency';

@Table
export class Rewards extends Model<Rewards> {
    @Column({ type: DataType.STRING, primaryKey: true, defaultValue: () => getUUID() }) id!: string;

    @ForeignKey(() => Currency)
    @Column({ type: DataType.STRING }) currencyId: string;

    @Column({ type: DataType.STRING }) name: string;

    @Column({ type: DataType.STRING }) amount: string;

    @BelongsTo(() => Currency, 'currencyId') currency:Currency;
}
