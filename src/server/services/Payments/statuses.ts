export const WAITING_FOR_PAYMENTS = 'Waiting for buyer funds';
export const PAYPAL_REFUND = 'PayPal Refund or Reversal';
export const QUEUED_FOR_NIGHTLY_PAYOUT = 'Queued for nightly payout';
export const COIN_CONFIRMED = 'We have confirmed coin reception from the buyer';
export const CANCELED_TIMEOUT = 'Cancelled / Timed Out';
export const PAYPAL_PENDING = 'PayPal Pending';
export const PAYMENT_COMPLETE = 'Payment Complete';

export const statusMap = {
  PAYPAL_REFUND: '-2',
  CANCELED_TIMEOUT: '-1',
  WAITING_FOR_PAYMENTS: '0',
  COIN_CONFIRMED: '1',
  QUEUED_FOR_NIGHTLY_PAYOUT: '2',
  PAYPAL_PENDING: '3',
  PAYMENT_COMPLETE: '100'
};
