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

export type TCardBasket = Pick<ICard, 'id' | 'title' | 'price'>;

export type TPaymentMethod = 'online' | 'offline';

export interface IOrderForm {
  payment: TPaymentMethod;
  address: string;
}

export interface IContactsForm {
  email: string;
  phone: string;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;


