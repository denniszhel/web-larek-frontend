import './scss/styles.scss';

import { AppApi } from './components/AppApi';
import { API_URL, CDN_URL } from "./utils/constants";
import { EventEmitter } from "./components/base/Events";
import { CardsData, BasketData, OrderData } from './components/AppData';
import { ICard, TCardBasket, IOrderForm, IContactsForm, IOrderResponce } from './types';
import { Page } from "./components/Page";
import { Card } from "./components/Card";
import { Modal } from "./components/common/Modal";
import { Basket } from "./components/Basket";
import { Order } from "./components/Order";
import { Contacts } from "./components/Contacts";
import { Success } from "./components/Success";
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventName } from './utils/constants';

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

events.on(EventName.itemsChanged, () => {
  page.catalog = cardsData.catalog.map((item: ICard) => {
    const card = new Card(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit(EventName.cardSelect, item),
      onClickButton: 'open'
    });
    return card.render(item);
  });
});

// Открыть карточку
events.on(EventName.cardSelect, (item: ICard) => {
  const itemInBasket = basketData.inBasket(item.id);
  const card = new Card(cloneTemplate(cardPreviewTemplate), {
    onClick: () => events.emit(EventName.cardMoveToBasket, item),
    onClickButton: 'basket',
    itemInBasket: itemInBasket
  });
  return modal.render({
    content: card.render(item)
  });
});

// Добавление карточки в корзину
events.on(EventName.cardMoveToBasket, (item: ICard) => {
  basketData.add({
    id: item.id,
    title: item.title,
    price: item.price
  });
  modal.close();
});

// Удаление карточки из корзины
events.on(EventName.cardMoveFromBasket, (item: TCardBasket) => {
  basketData.delete(item);
  //events.emit('basket:open');
  events.emit(EventName.basketOpen);
});

// Открытие корзины пользоватлем
events.on(EventName.basketOpen, () => {
  const basket = new Basket(cloneTemplate(basketTemplate), events);
  let currentIndex: number = 0;
  basket.items = basketData.items.map((item: TCardBasket) => {
    const card = new Card(cloneTemplate(cardBasketTemplate), {
      onClick: () => events.emit(EventName.cardMoveFromBasket, item),
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
events.on(EventName.basketChanged, () => {
  page.counter = basketData.items.length;
});

// Открытие формы заказа
events.on(EventName.orderOpen, () => {
  return modal.render({
    content: orderForm.render({
      payment: 'online',
      address: '',
      valid: false,
      errors: []
    })
  });
});

// Изменилось состояние валидации формы заказа
events.on(EventName.orderErrorsChange, (errors: Partial<IOrderForm>) => {
  const { address } = errors;
  orderForm.valid = !address;
  orderForm.errors = Object.values({address}).filter(i => !!i).join('; ');
});

// Нажатие на кнопку далее
events.on(EventName.orderSubmit, () => {
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
events.on(EventName.contactsErrorsChange, (errors: Partial<IContactsForm>) => {
  const { email, phone } = errors;
  contactsForm.valid = !email && !phone;
  contactsForm.errors = Object.values({ email, phone }).filter(i => !!i).join('; ');
});


// Изменилось одно из полей ввода заказа
events.on(/^order|contacts\..*:change/, (data: { field: keyof Pick<IOrderForm, 'address'>, value: string }) => {
  if (data) {
    orderData.setField(data.field, data.value);
  }
});

// Изменился способ оплаты заказа на card
events.on(EventName.orderPaymentCard, () => {
  orderData.payment = 'online';
});

// Изменился способ оплаты заказа на cash
events.on(EventName.orderPaymentCash, () => {
  orderData.payment = 'offline';
});

// Заказ успешно отправлен
events.on(EventName.contactsSubmit, () => {
  orderData.setItems(basketData.items);
  orderData.total = basketData.total;
  basketData.clear();
  const successForm = new Success(cloneTemplate(successTemplate), {
    onClick: () => events.emit(EventName.orderSuccess)
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
events.on(EventName.orderSuccess, () => {
  orderData.clear();
  modal.close();
});

// Блокируем прокрутку страницы если открыта модалка
events.on(EventName.modalOpen, () => {
  page.locked = true;
});

// ... и разблокируем
events.on(EventName.modalClose, () => {
  page.locked = false;
});

api.getProductList()
    .then(cardsData.setCatalog.bind(cardsData))
    .catch(console.error);

