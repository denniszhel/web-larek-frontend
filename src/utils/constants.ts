export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export enum EventName {
  cardSelect = 'card:select',
  cardMoveToBasket = 'card:moveToBasket',
  cardMoveFromBasket = 'card:moveFromBasket',
  basketOpen = 'basket:open',
  basketChanged = 'basket:changed',
  orderOpen = 'order:open',
  orderPaymentCard = 'order:paymentCard',
  orderPaymentCash = 'order:paymentCash',
  orderErrorsChange = 'orderErrors:change',
  orderSubmit = 'order:submit',
  contactsErrorsChange = 'contactsErrors:change',
  contactsSubmit = 'contacts:submit',
  orderSuccess = 'order:success',
  modalOpen = 'modal:open',
  modalClose = 'modal:close',
  itemsChanged = 'items:changed'
};

export const settings = {};
