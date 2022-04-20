import {
  BelongsTo, Column, DataType, ForeignKey, Model, Table
} from 'sequelize-typescript';
import { getUUID, groupByField } from '../utils';
import { VerificationServices } from './VerificationServices';

@Table({ tableName: 'vFieldsInfo' })
export class VerificationFieldsInfo extends Model<VerificationFieldsInfo> {
    @Column({ type: DataType.STRING, primaryKey: true, defaultValue: () => getUUID() }) id!: string;

    @ForeignKey(() => VerificationServices)
    @Column({ type: DataType.STRING, allowNull: false }) vServiceId!: string;

    @Column({ type: DataType.STRING, allowNull: false }) countryCode!: string;

    @Column({ type: DataType.JSONB, defaultValue: {} }) fieldsInfo: object;

    @Column({ type: DataType.JSONB, defaultValue: [] }) rawFieldsInfo: object;

    @Column({ type: DataType.JSONB, defaultValue: [] }) requiredFields: object;

    @BelongsTo(() => VerificationServices, 'vServiceId')vService:VerificationServices;

    static async getCountrySpecFields(country ?: string) {
      const options: any = { raw: true, attributes: ['countryCode', 'fieldsInfo', 'requiredFields'] };
      if (country) {
        options.where = { countryCode: country };
      }

      const countries = this.findAll(options);
      const groupedCountries = {};
      for (const i in countries) {
        groupedCountries[countries[i].countryCode] = {
          fields: countries[i].fieldsInfo,
          required: countries[i].requiredFields
        };
      }

      return groupByField(countries, 'countryCode');
    }
}
