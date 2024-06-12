import { IEvents } from "./base/events";
import { ICard, IBasket, TCardBasket, IOrder, TPaymentMethod, IOrderForm, IContactsForm, FormErrors } from "../types";

export class CardData implements ICard {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;

  constructor(item: ICard, protected events: IEvents) {
    Object.assign(this, item);
  }
}

export class CardsData {
  private total: number;
  public catalog: ICard[];

  constructor(protected events: IEvents) {}

  setTotal(value: number) {
    this.total = value;
  }

  setCatalog(items: ICard[]) {
    this.catalog = items.map(item => new CardData(item, this.events));
    this.events.emit('items:changed', { catalog: this.catalog });
  }
}

export class BasketData implements IBasket {
  public total: number;
  public items: TCardBasket[];

  constructor(protected events: IEvents) {
    this.total = 0;
    this.items = [];
  }

  add(item: TCardBasket): void {
    this.items.push(item);
    this.total += item.price;
    this.events.emit('basket:changed');
  }

  delete(itemToDelete: TCardBasket): void {
    this.total = 0;
    this.items = this.items.filter((item: TCardBasket) => item.id !== itemToDelete.id);
    this.items.map((item: TCardBasket) => this.total += item.price);
    this.events.emit('basket:changed');
  }

  clear(): void {
    this.total = 0;
    this.items = [];
    this.events.emit('basket:changed');
  }

  inBasket(itemId: string): boolean {
    const index = this.items.findIndex((item: TCardBasket) => item.id === itemId);
    return index !== -1;
  }
}

export class OrderData implements IOrder {
  payment: TPaymentMethod;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
  formErrors: FormErrors = {};

  constructor(protected events: IEvents) {
    this.payment = 'online';
    this.email = '';
    this.phone = '';
    this.address = '';
    this.total = 0;
    this.items = [];
  }

  setField(field: keyof (IOrderForm & IContactsForm), value: string) {
    this[field] = value;

    if (field === 'address') {
      this.validateOrder();
    }

    if (field === 'email' || field === 'phone') {
      this.validateContacts();
    }
  }

  setItems(cardsBasket: TCardBasket[]): void {
    this.items = cardsBasket.filter((cb: TCardBasket) => cb.price !== null).map((cb: TCardBasket) => { return cb.id});
  }

  validateOrder(): boolean {
    const errors: typeof this.formErrors = {};
    if (!this.address) {
        errors.address = 'Необходимо указать адрес доставки';
    }
    this.formErrors = errors;
    this.events.emit('orderErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  validateContacts(): boolean {
    const errors: typeof this.formErrors = {};
    if (!this.email) {
        errors.email = 'Необходимо указать email';
    }
    if (!this.phone) {
      errors.phone = 'Необходимо указать телефон';
  }
  this.formErrors = errors;
    this.events.emit('contactsErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }
}