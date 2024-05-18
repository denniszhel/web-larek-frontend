export interface ICardsData {
  total: number;
  cards: ICard[] | IResponceError[];
  getCard(cardId: string): ICard;
}

export interface ICard {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
  putCardToBasket(cardData: TCardBasket): void;
}

export interface IBasket {
  items: TCardBasket[];
  total: number;
  removeCardFromBasket(cardId: string): void;
  createOrder(items: TCardBasket[]): void;
}

export interface IOrder {
  payment: TPaymentMethod;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
  checkContactsValidation(fieldsToValidate: string[]): void;
  sendOrder(order: IOrder): IOrderResponce | IResponceError;
}

export interface IOrderResponce {
  id: string;
  total: number;
}

export interface IResponceError {
  error: string;
}

export type TCardCatalog = Pick<ICard, 'id' | 'image' | 'title' | 'category' | 'price'>;
export type TCardBasket = Pick<ICard, 'id' | 'title' | 'price'>;

export type TPaymentMethod = 'online' | 'offline';
export type TOrderCheckout = Pick<IOrder, 'payment' | 'address' | 'items'>;
export type TOrderContacts = Pick<IOrder, 'email' | 'phone' | 'items'>;


