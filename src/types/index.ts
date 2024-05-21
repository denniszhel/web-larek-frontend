export interface ICardsData {
  total: number;
  items: ICard[] | IResponceError[];
}

export interface ICard {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export interface IBasket {
  items: TCardBasket[];
  total: number;
}

export interface IOrder {
  payment: TPaymentMethod;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
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


