# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

Методы запросов к серверу
```
type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';
```

Имя события
```
type EventName = string | RegExp;
```

Интерфейс брокера событий
```
interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}
```

Карточка товара. 
```
export interface ICard {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}
```

Корзина покупок.
```
export interface IBasket {
  items: TCardBasket[];
  total: number;
}
```

Данные карточки товара в корзине покупок.
```
export type TCardBasket = Pick<ICard, 'id' | 'title' | 'price'>;
```

Заказ
```
export interface IOrder {
  payment: TPaymentMethod;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}
```

Перечисление способов оплаты
```
export type TPaymentMethod = 'online' | 'offline';
```

Ответ сервера при создании заказа. 
```
export interface IOrderResponce {
  id: string;
  total: number;
}
```

Форма заказа.
```
export interface IOrderForm {
  address: string;
}
```

Форма контактов.
```
export interface IContactsForm {
  email: string;
  phone: string;
}
```

Ошибки полей формы (для валидации).
```
export type FormErrors = Partial<Record<keyof IOrder, string>>;
```

События форм
```
interface IActions {
    onClick: () => void;
}
```

Параметры открытия формы карточки
```
interface ICardOptions {
  onClick: (event: MouseEvent) => void;
  onClickButton: 'open' | 'basket' | 'delete';
  basketIndex?: number;
  itemInBasket?: boolean;
}
```

Интерфейс основной страницы
```
interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
- слой представления, отвечает за отображение данных;
- слой данных, отвечает за хранение и измерение данных;
- презентер, отвечает за связь представления и данных.

### Базовые классы

#### Класс Api
Содержит в себе базовую логику отправки запросов. В контруктор передаётся базовый эндпоинт сервера и 
опциональный объект с заголовками запросов.

Параметры конструктора:
- baseUrl: string - базовый адрес сервера;
- options: RequestInit - объект с заголовками запроса.

Поля:
- baseUrl: string;
- options: RequestInit;

Методы:
- get(uri: string): Promise<T> - выполняет GET запрос на переданный в параметрах адрес и возвращает промис с объектом, 
которым ответил сервер;
- post(uri: string, data: object, method: ApiPostMethods): Promise<T> - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на эндпоинт, переданный как параметр при вызове метода. По умолчанию выполняется POST запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове;
- handleResponse(response: Response): Promise<Т> - метод обрабатывает ответ сервера и возвращает json или текст ошибки.


#### Класс EventEmitter
Реализует интерфейс `IEvents`. Брокер событий. Позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий. Конструктор не имеет параметров.

Поля:
- events: Map<EventName, Set<Function>> - хранит соответствия имени события и функции-обработчика этого события.

Методы:
- on<T extends object>(eventName: EventName, callback: (event: T) => void): void - подписка на событие;
- off(eventName: EventName, callback: Function): void - отмена подписки на событие.
- emit<T extends object>(eventName: string, data?: T): void - инициализация события;
- trigger<T extends object>(eventName: string, context?: Partial<T>): void - генерируюет заданное событие с заданными
аргументами. Это позволяет передавать его в качестве обработчика события в другие классы. Эти классы будут генерировать события, не будучи при этом напрямую зависимыми от класса EventEmitter..

### Классы данных

#### Класс CardsData
Класс отвечает за хранение и логику работы с карточками товаров, полученными с сервера. Реализует интерфейс `ICardsData`.

Параметры контруктора:
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _total: number - общее стоимость товара;
- _catalog: ICard[] - массив товаров;

Методы:
- setTotal(value: number): void - заполняет общую стоимость товаров
- setCatalog(items: ICard[]): void - заполняет католог товаров на главной странице.

#### Класс CardData
Класс отвечает за хранение данных карточки товара.

Параметры конструктора:
- item: Partial<ICard> - данные карточки;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _id: string - id товара;
- _description: string - описание товара;
- _image: string - изображение товара;
- _title: string - название товара;
- _category: string - категория товара;
- _price: number - цена товара.

#### Класс OrderData
Класс отвечает за хранение и логику работы с данными заказа.

Параметры конструктора:
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- payment: TPayment - способ оплаты;
- email: string - адрес электронной почты;
- phone: string - номер телефона;
- adress: string - адрес доставки;
- items: string[] - массив с id товаров из корзины;
- formErrors: FormErrors - описания ошибок валидации полей формы заказа.

Методы:
- setField(field: keyof (IOrderForm & IContactsForm), value: string): void - устанаваливает значение поля заказа;
- setItems(items: string[]): void - устанаваливает массив с id товаров из корзины;
- validateOrder(): boolean - метод валидирует массив полей формы заказа.
- validateContacts(): boolean - метод валидирует массив полей формы контактов.

#### Класс BasketData
Класс отвечает за хранение товаров в корзине и логику работы с ними. Реализует интерфейс `IBasket`.

Параметры конструкутора:
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _items: TCardBasket[] - список товаров;
- _total: number - общая стоимость товаров в корзине.

Методы:
- add(item: TCardBasket): void - добавляет товар в корзину;
- delete(itemToDelete: TCardBasket): void - удаляет карточку из корзины по её Id.
- clear(): void - метод очищает корзину;
- inBasket(itemId: string): boolean - проверяет, есть ли карточка с заданным id в корзине.

### Классы представления

Все классы представления отвечают за отображение внутри контейнера (DOM-элемент) передаваемых в них данных.

#### Базовый Класс Component<T>
Класс является дженериком и родителем всех компонентов слоя представления. В дженерик принимает тип объекта, в котором данные будут передаваться в метод `render` для отображения данных в компоненте. 

Параметры конструктора:
- container: HTMLElement - элемент разметки, являющийся основным родительским контейнером компонента.

Методы:
- render(data?: Partial<T>): HTMLElement - отвечает за сохранение полученных в параметре данных в полях компонентов через их сеттеры, возвращает обновленный контейнер компонента.

#### Общий класс Modal
Наследуется от класса `Component`. Реализует модальное окно. Устанавливает слушатели на клавиатуру, для закрытия модального окна по Esc, на клик в оверлей и кнопку-крестик для закрытия попапа. В метод `render` принимает элемент разметки содержимого.\

Параметры конструктора:
- container: HTMLElement - элемент разметки, являющийся основным родительским контейнером компонента.
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _content: HTMLElement - содержимое модального окна.
- _closeButton: HTMLButtonElement - кнопка закрытия окна.

Методы: 
- setСontent(value: HTMLElement): void - устанавливает содержимое модального окна;
- open(): void - открытие модального окна;
- close(): void - очистка `content` и закрытие модального окна;
- render(data: IModalData): HTMLElement - переопределяет метод родителя, показывая отрендеренное модальное окно на странице.

#### Общий класс Form
Наследуется от класса `Component`. Реализует форму в модальном окне. Устанавливает слушатели на изменение полей ввода и `submit` формы.

Параметры конструктора: 
- container: HTMLFormElement - скопированный template формы заказа или контактов;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Алгоритм конструктора: 
- заполняет _formName, _inputs и _errors;
- назначает обработчики событий сабмита формы и изменения поля ввода.

Поля:
- _errors: Record<string, HTMLElement> - объект хранящий все элементы для вывода ошибок под полями формы с привязкой к атрибуту name инпутов;
- _submit: HTMLButtonElement - кнопка сабмита формы (далее или оплатить);

Методы:
- setValid(value: boolean): void - изменяет активность кнопки далее;
- setError(value: string): void - принимает объект с данными для отображения или сокрытия текстов ошибок под полями ввода;
- onInputChange(field: keyof T, value: string) - генерирует событие изменения значения полей ввода формы.

#### Общий класс Success 
Наследуется от класса `Component`. Реализует отображение результата отправки заказа на сервер. При сабмите инициирует событие закрытия формы. В метод `render` принимает объект интерфейса `IOrderResponce`.

Параметры конструктора:
- container: HTMLElement - скопированный template результата отправки заказа;
- actions: IActions - события формы.

Поля:
- _total: HTMLElement - общая стоимость заказа.
- _close: HTMLButtonElement - Кнопка за новыми покупками.

Методы:
- setTotal(value: number): void - устанавливает текст стоимости заказа.

#### Класс Basket
Наследуется от класса `Component`. Реализует отображение корзины с товарами в модальном окне. В метод `render` принимает массив элементов разметки класса `CardInBasket`.

Параметры конструктора:
- container: HTMLElement - скопированный template корзины;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Алгоритм конструктора:
- устанавливает событие нажатия кнопки создания заказа.

Поля: 
- _total: HTMLElement - общая стоимость товаров в корзине.
- _list: HTMLElement[] - массив карточек товара;
- _button: HTMLButtonElement - кнопка начала оформления заказа.

Методы:
- setItems(items: HTMLElement[]) - заполняет список товаров.
- setSelected(items: string[]) - устанавливает доступность кнопки начала оформления заказа, если список товаров не пустой.
- setTotal(total: number) - устанавливает общую сумму товаров в корзине и форматирует цифру.

#### Класс Card
Наследуется от класса `Component`. Реализует отображение карточки товара. В метод `render` принимает объект `ICard`.

Параметры конструктора:
- container: HTMLElement - скопированный template карточки;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _image: HTMLImageElement - изображение товара;
- _category: HTMLElement - категория товара;
- _title: HTMLElement - название товара;
- _description: HTMLElement - описание товара;
- _price: HTMLElement - цена товара;
- _button: HTMLButtonElement - кнопка действия с карточкой;
- _basketItemIndex: HTMLElement - номер строки товара в корзине.

Методы:
- setId(value: string): void - получает id товара;
- getId(): string - получает id товара;
- setTitle(value: string): void - получает название товара;
- getTitle(): string - получает название товара;
- setCategory(value: string): void - получает категорию товара;
- getCategory(): string - получает категорию товара;
- setDesciption(value: string): void - получает описание товара;
- getDesciption(): string - получает описание товара;
- setPrice(value: number): void - получает цену товара;
- getPrice(): number - получает цену товара;
- setImage(value: string): void - получает изображение товара;
- getCategoryStyle(categoryValue: string): string - получает имя класса для категории товара.

#### Класс Order
Наследуется от класса `Form`, реализует интерфейс `IOrderForm`. Нужен для ввода способа оплаты и адреса доставки.

Параметры конструктора:
- container: HTMLFormElement - скопированный template формы;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Методы:
- setАdress(value: string) - устанавливает значение адреса.

#### Класс Contacts
Наследуется от класса `Form`, реализует интерфейс `IContactsForm`. Нужен для ввода садреса электронной почты и номера телефона.

Параметры конструктора:
- container: HTMLFormElement - скопированный template формы;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Методы:
- setPhone(value: string) - устанавливает значение номера телефона;
- setЕmail(value: string) - устанавливает значение адреса электронной почты.

#### Класс Page
Наследуется от класса `Component`. Отвечает за отображение контента страницы. Устанавливает обработчик события нажалия на корзину в шапке страницы.

Параметры конструктора:
- container: HTMLElement - document.body;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _counter: HTMLElement - счётчик товаров в корзине;
- _catalog: HTMLElement - контейнер для карточек товаров;
- _wrapper: HTMLElement - контейнер всех элементов страницы, для блокировки модальными окнами;
- _basket: HTMLElement - корзина в шапке страницы;

Методы:
- set counter(value: number): void - устанавливает значение счётчика товаров в корзине;
- set catalog(items: HTMLElement[]): void - добавляет/заменяет карточки товаров на странице;
- set locked(value: boolean): void - устанавливает или снимает блокировку страницы модальными окнами.

### Слой коммуникации

#### Класс AppApi
Наследует класс `Api`. Предоставляет методы реализующие взаимодействие с бэкендом сервиса.

Параметры конструктора: 
- api: Api - экземпляр класса `Api`.

Методы:
- getProductList(): Promise<ICardsData> - получает данные товаров с сервера;
- getProductItem(CardId: string): Promise<ICard | IResponceError> - получает карточку товара по её Id;
- postOrder(order: IOrder): Promise<IOrderResponce | IResponceError> - отправляет заказ на сервер.

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

*Список всех событий, которые могут генерироваться в системе:*\

*События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)*
- `card:select` - выбор карточки для отображения в модальном окне;
- `cardPreview:moveToBasket` - помещение карточки в корзину;
- `cardBasket:moveFromBasket` - удаление карточки из корзину;
- `basket:open` - открытие модального окна корзины товаров;
- `basket:changed` - обновление индикатора количества товаров в корзине
- `order:open` - открытие модального окна с формой первой части заказа;
- `order.fieldName:change` - изменилось одно из полей ввода заказа;
- `order:paymentCard` - выбран способ оплаты картой;
- `order:paymentCash` - выбран способ оплаты наличными;
- `orderErrors:change` - изменилось состояние валидации формы заказа;
- `order:submit` - событие, генерируемое при нажатии кнопки "далее";
- `contactsErrors:change` - изменилось состояние валидации формы контактов;
- `contacts.fieldName:change` - изменилось одно из полей ввода контактов;
- `contacts:submit` - событие, генерируемое при нажатии кнопки "оплатить";
- `order:success` - событие, генерируемое при нажатии кнопки "за новыми покупками";
- `modal:open` - блокировка страницы, если открыто модальное окно;
- `modal:close` - разблокировка страницы, если закрыто модальное окно;

