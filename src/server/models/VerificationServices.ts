import {
  Column, DataType, ForeignKey, HasMany, Model, Table
} from 'sequelize-typescript';
import { getUUID } from '../utils';
import { VerificationFieldsInfo } from './VerificationFieldsInfo';
import { Countries } from './Countries';

@Table({ tableName: 'vServices' })
export class VerificationServices extends Model<VerificationServices> {
    @Column({ type: DataType.STRING, primaryKey: true, defaultValue: () => getUUID() }) id!: string;

    @Column({ type: DataType.STRING }) name!: string;

    @Column({ type: DataType.JSONB, defaultValue: [] }) allowCountries: string;

    @HasMany(() => VerificationFieldsInfo, 'vServiceId')fieldsInfo:VerificationFieldsInfo[];

    static async getViableCountriesList() {
      const res = await this.sequelize.query(`select *  
    from "CountryCodes"
    where code in (
        select json_array_elements_text(json_agg(codes)) countries 
        from "vServices",jsonb_array_elements("vServices"."allowCountries") as "codes")
        `);
      const countries = {};
      if (res[0].length) {
        for (const i in res[0]) {
          countries[res[0][i].code] = res[0][i].name;
        }
      }

      return countries;
    }
}
