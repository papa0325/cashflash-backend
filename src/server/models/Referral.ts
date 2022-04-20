import {
  Model, Column, Table, DataType, ForeignKey, BelongsTo
} from 'sequelize-typescript';
import { getUUID, addJob } from '../utils';
import { User } from './User';
import { ReferralStat } from './ReferralStat';

@Table
export class Referral extends Model<Referral> {
  @Column({ type: DataType.STRING, primaryKey: true, defaultValue: () => getUUID() }) id!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING })
  userId!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING })
  refId!: string;

  @BelongsTo(() => User, 'refId') referral: User;

  @BelongsTo(() => User, 'userId') user: User;

  @Column({ type: DataType.BOOLEAN, defaultValue: false }) isApprove: boolean;

  static async approveReferral(refId) {
    try {
      const refRecord = await this.findOne({
        where: { refId }
      });

      console.log('refRecord', refRecord);

      if (refRecord && !refRecord.isApprove) {
        const referrerStat = await ReferralStat.findByPk(refRecord.userId);

        console.log('referrerStat', referrerStat);

        if (referrerStat) {
          const currentRefs = referrerStat.refCount + 1;

          referrerStat.set({ refCount: currentRefs });
          referrerStat.save();
          console.log(111, currentRefs);
        }

        refRecord.set({ isApprove: true });
        await refRecord.save();
      }

      return true;
    }
    catch (e) {
      console.log(e);
    }
  }
}
