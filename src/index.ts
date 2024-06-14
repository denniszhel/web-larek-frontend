import './scss/styles.scss';

import { AppApi } from './components/AppApi';
import { API_URL, CDN_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/EventsTemp";
import { CardsData, BasketData, OrderData } from './components/AppData';
import { ICard, TCardBasket, IOrderForm, IContactsForm, IOrderResponce } from './types';
import { Page } from "./components/Page";
import { Card } from "./components/Card";
import { Modal } from "./components/common/Modal";
import { Basket } from "./components/Basket";
import { Order } from "./components/Order";
import { Contacts } from "./components/Contacts";
import { Success } from "./components/common/Success";
import { cloneTemplate, ensureElement } from './utils/utils';

const events = new EventEmitter();
const api = new AppApi(CDN_URL, API_URL);

// Модель данных приложения
const cardsData = new CardsData(events);
const basketData = new BasketData(events);
const orderData = new OrderData(events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contctsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const orderForm = new Order(cloneTemplate(orderTemplate), events);
const contactsForm = new Contacts(cloneTemplate(contctsTemplate), events);

events.on('items:changed', () => {
  page.catalog = cardsData.catalog.map((item: ICard) => {
    const card = new Card(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('card:select', item),
      onClickButton: 'open'
    });
    return card.render(item);
  });
});

// Открыть карточку
events.on('card:select', (item: ICard) => {
  const itemInBasket = basketData.inBasket(item.id);
  const card = new Card(cloneTemplate(cardPreviewTemplate), {
    onClick: () => events.emit('card:moveToBasket', item),
    onClickButton: 'basket',
    itemInBasket: itemInBasket
  });
  return modal.render({
    content: card.render(item)
  });
});

// Добавление карточки в корзину
events.on('card:moveToBasket', (item: ICard) => {
  basketData.add({
    id: item.id,
    title: item.title,
    price: item.price
  });
  modal.close();
});

// Удаление карточки из корзины
events.on('card:moveFromBasket', (item: TCardBasket) => {
  basketData.delete(item);
  events.emit('basket:open');
});

// Открытие корзины пользоватлем
events.on('basket:open', () => {
  const basket = new Basket(cloneTemplate(basketTemplate), events);
  let currentIndex: number = 0;
  basket.items = basketData.items.map((item: TCardBasket) => {
    const card = new Card(cloneTemplate(cardBasketTemplate), {
      onClick: () => events.emit('card:moveFromBasket', item),
      onClickButton: 'delete',
      basketIndex: ++currentIndex
    });
    return card.render(item);
  });
  basket.total = basketData.total;
  return modal.render({
    content: basket.render()
  });
});

// Обновление индикатора количества товаров в корзине 
events.on('basket:changed', () => {
  page.counter = basketData.items.length;
});

// Открытие формы заказа
events.on('order:open', () => {
  return modal.render({
    content: orderForm.render({
      address: '',
      valid: false,
      errors: []
    })
  });
});

// Изменилось состояние валидации формы заказа
events.on('orderErrors:change', (errors: Partial<IOrderForm>) => {
  const { address } = errors;
  orderForm.valid = !address;
  orderForm.errors = Object.values({address}).filter(i => !!i).join('; ');
});

// Нажатие на кнопку далее
events.on('order:submit', () => {
  return modal.render({
    content: contactsForm.render({
      email: '',
      phone: '',
      valid: false,
      errors: []
    })
  });
});

// Изменилось состояние валидации формы контактов
events.on('contactsErrors:change', (errors: Partial<IContactsForm>) => {
  const { email, phone } = errors;
  contactsForm.valid = !email && !phone;
  contactsForm.errors = Object.values({ email, phone }).filter(i => !!i).join('; ');
});


// Изменилось одно из полей ввода заказа
events.on(/^order|contacts\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  if (data) {
    orderData.setField(data.field, data.value);
  }
});

// Изменился способ оплаты заказа на card
events.on('order:paymentCard', () => {
  orderData.payment = 'online';
});

// Изменился способ оплаты заказа на cash
events.on('order:paymentCash', () => {
  orderData.payment = 'offline';
});

// Заказ успешно отправлен
events.on('contacts:submit', () => {
  orderData.setItems(basketData.items);
  orderData.total = basketData.total;
  basketData.clear();
  const successForm = new Success(cloneTemplate(successTemplate), {
    onClick: () => events.emit('order:success')
  });
  api.postOrder(orderData)
    .then((data: IOrderResponce) => {
      return modal.render({
        content: successForm.render({
          total: data.total
        })
      });
    })
    .catch(err => {
      console.log(err);
    });
});

// Нажата кнопка за новыми покупками
events.on('order:success', () => {
  modal.close();
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
  page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
  page.locked = false;
});

api.getProductList()
    .then(cardsData.setCatalog.bind(cardsData))
    .catch(err => {
        console.error(err);
    });

