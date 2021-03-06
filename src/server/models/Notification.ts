import {
  BelongsTo, Column, DataType, ForeignKey, Model, Table
} from 'sequelize-typescript';
import { getUUID } from '../utils';
import { User } from './User';

interface INotificationMeta {
  to: string;
  from: string;
}

@Table
export class Notification extends Model<Notification> {
  @Column({ type: DataType.STRING, defaultValue: () => getUUID(), primaryKey: true }) id!: string;

  @ForeignKey(() => User) @Column(DataType.STRING) userId: string;

  @BelongsTo(() => User, { onDelete: 'CASCADE' }) user: User;

  @Column({ type: DataType.BOOLEAN, defaultValue: false }) seen: boolean;

  @Column(DataType.INTEGER) type: number;

  @Column(DataType.JSONB) meta: INotificationMeta;
}
