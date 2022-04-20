/*eslint-disable*/
import { output, error } from '../../utils';
import { statusMap } from '../../services/Payments/statuses';
import { CpTransaction } from '../../models/cp-transaction';
import { CpBalance } from '../../models/cp-balance';

export const hook = async (request, h) => {
  try {
    const paymentInfo: any = request.payload;
    if (paymentInfo && paymentInfo.txn_id) {
      const transaction = await CpTransaction.findOne({
        where: {
          txId: paymentInfo.txn_id
        }
      });

      if (transaction) {
        transaction.set({ status: paymentInfo.status_text, fee: paymentInfo.fee });
        await transaction.save();
        if (statusMap.PAYMENT_COMPLETE == paymentInfo.status) {
          const userBalance = await CpBalance.findOne({
            where: { userId: transaction.userId }
          });
          const balance: any = userBalance.amount;
          if (userBalance) {
            userBalance.set({ amount: parseFloat(balance) + parseFloat(paymentInfo.amount1) });
            await userBalance.save();
          }
        }

        return output({ result: false });
      }
    }

    return output({ result: false });
  }
  catch (e) {
    return error(500, e, {});
  }
};
