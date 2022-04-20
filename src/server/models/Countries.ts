import {
  Table,
  Column,
  DataType,
  Model
} from 'sequelize-typescript';

@Table({ tableName: 'CountryCodes', timestamps: false })
export class Countries extends Model<Countries> {
    @Column({
      type: DataType.STRING,
      unique: true,
      primaryKey: true,
      autoIncrement: false
    }) code!: string;

    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    name: string;
}
