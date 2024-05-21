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

Список карточек товара
```
export interface ICardsData {
  total: number;
  cards: ICard[] | IResponceError[];
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

Данные карточки товара в списке карточек
```
export type TCardCatalog = Pick<ICard, 'id' | 'image' | 'title' | 'category' | 'price'>;
```

Данные карточки товара в корзине покупок
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

Данные первой части оформления заказа.
```
export type TOrderCheckout = Pick<IOrder, 'payment' | 'address' | 'items'>;
```

Данные второй части оформления заказа.
```
export type TOrderContacts = Pick<IOrder, 'email' | 'phone' | 'items'>;
```

Ответ сервера при создании заказа. 
```
export interface IOrderResponce {
  id: string;
  total: number;
}
```

Ответ сервера с ошибкой.
```
export interface IResponceError {
  error: string;
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
- items: ICard[] - данныее карточек;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _total: number - общее стоимость товара;
- _catalog: ICard[] - массив товаров;

Методы:
- setTotal(value: number): void - заполняет общую стоимость товаров
- setCatalog(items: ICard[]): void - заполняет католог товаров на главной странице.

#### Класс CardData
Класс отвечает за хранение и логику работы с карточой товара.

Параметры конструктора:
- data: Partial<ICard> - данные карточки;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _id: string - id товара;
- _description: string - описание товара;
- _image: string - изображение товара;
- _title: string - название товара;
- _category: string - категория товара;
- _price: number - цена товара.

Методы:
- getId(): string - получает id товара;
- getDescription(): string - получает описание товара;
- getImage(): string - получает изображение товара;
- getTitle(): string - получает название товара;
- getCategory(): string - получает категорию товара;
- getPrice(): number - получает цену товара.

#### Класс OrderData
Класс отвечает за хранение и логику работы с данными заказа.

Параметры конструктора:
- data: Partial<IOrder> - данные заказа;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _payment: TPayment - способ оплаты;
- _email: string - адрес электронной почты;
- _phone: string - номер телефона;
- _adress: string - адрес доставки;
- _items: string[] - массив с id товаров из корзины.

Методы:
- getPayment(): TPayment - получает способ оплаты;
- getEmail(): string - получает адрес электронной почты;
- getPhone(): string - получает номер телефона;
- getAdress(): string - получает адрес доставки;
- getItems(): string[] - получает массив с id товаров из корзины;
- setPayment(value: TPayment): void - устанаваливает способ оплаты;
- setEmail(value: string): void - устанаваливает адрес электронной почты;
- setPhone(value: string): void - устанаваливает номер телефона;
- setAdress(value: string): void - устанаваливает адрес доставки;
- setItems(items: string[]): void - устанаваливает массив с id товаров из корзины;
- checkFieldSetValidation(fieldNames: string[]): boolean - метод валидирует массив полей формы.
- checkField(fieldName: string): string - метод проверяет валидность поля формы и возвращает строку с ошибкой или пустую строку.
- sendOrder(order: IOrder): IOrderResponce | IResponceError - метод отправляет данные заказа на сервер.

#### Класс BasketData
Класс отвечает за хранение товаров в корзине и логику работы с ними. Реализует интерфейс `IBasket`.

Параметры конструкутора:
- data: Partial<IBasket> - данные корзины;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _items: TCardBasket[] - список товаров;
- _total: number - общая стоимость товаров в корзине.

Методы:
- getItems(): TCardBasket[] - получает список товаров;
- getTotal(): number - получает общую стоимость товаров в корзине;
- setItems(items: TCardBasket[]): void - устанавливает список товаров;
- setTotal(value: number): void - устанавливает общую стоимость товаров в корзине;
- addCard(cardObj: TCardBasket): void - добавляет товар в корзину;
- clearBasket(): void - метод очищает корзину;
- removeCard(cardId: string): void - удаляет карточку из корзины по её Id.

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
- close(): void - очистка `content` и закрытие модального окна.

#### Общий класс Form
Наследуется от класса `Component`. Реализует форму в модальном окне. Устанавливает слушатели на изменение полей ввода и `submit` формы.

Параметры конструктора: 
- container: HTMLFormElement - скопированный template формы заказа или контактов;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Алгоритм конструктора: 
- заполняет _formName, _inputs и _errors;
- назначает обработчики событий сабмита формы и изменения поля ввода.

Поля:
- _formName: HTMLElement - значение атрибута name формы (нужно для формирования имен кастомных событий);
- _inputs: NodeListOf - коллекция всех полей ввода формы;
- _errors: Record<string, HTMLElement> - объект хранящий все элементы для вывода ошибок под полями формы с привязкой к атрибуту name инпутов;
- _submit: HTMLButtonElement - кнопка сабмита формы (далее или оплатить);

Методы:
- setValid(isValid: boolean): void - изменяет активность кнопки далее;
- setError(data: { field: string, value: string, validInformation: string }): void - принимает объект с данными для отображения или сокрытия текстов ошибок под полями ввода;
- getInputValues(): Record<string, string> - возвращает объект с данными из полей формы, где ключ - name инпута, значение данные введенные пользователем;
- showInputError (field: string, errorMessage: string): void - отображает полученный текст ошибки под указанным полем ввода;
- hideInputError (field: string): void - очищает текст ошибки под указанным полем ввода
- close (): void - расширяет родительский метод дополнительно при закрытии очищая поля формы и деактивируя кнопку сабмита.

#### Общий класс OrderResult 
Наследуется от класса `Component`. Реализует отображение результата отправки заказа на сервер. При сабмите инициирует событие закрытия формы. В метод `render` принимает объект интерфейса `IOrderResponce`.

Параметры конструктора:
- container: HTMLElement - скопированный template результата отправки заказа;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _submitButton: HTMLButtonElement - Кнопка за новыми покупками.

Методы:
- close (): void - расширяет родительский метод дополнительно при закрытии очищая корзину товаров.

#### Общий класс Basket
Наследуется от класса `Component`. Реализует отображение корзины с товарами в модальном окне. В метод `render` принимает массив элементов разметки класса `CardInBasket`.

Параметры конструктора:
- container: HTMLElement - скопированный template корзины;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Алгоритм конструктора:
- устанавливает событие нажатия кнопки создания заказа.

Поля: 
- _basketPrice: HTMLElement - общая стоимость товаров в корзине.
- _basketList: HTMLElement[] - массив карточек товара;
- _createOrderButton: HTMLButtonElement - кнопка начала оформления заказа.

#### Класс Card
Наследуется от класса `Component`. Реализует отображение карточки товара. В метод `render` принимает объект `ICard`.

Параметры конструктора:
- container: HTMLElement - скопированный template карточки;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _cardImage: HTMLImageElement - изображение товара;
- _cardCategory: HTMLElement - категория товара;
- _cardTitle: HTMLElement - название товара;
- _cardDesciption: HTMLElement - описание товара;
- _cardPrice: HTMLElement - цена товара.

Методы:
- getId(): string - получает id товара;
- getImage(): string - получает изображение товара;
- getCategory(): string - получает категорию товара;
- getTitle(): string - получает название товара;
- getDesciption(): string - получает описание товара;
- getPrice(): number - получает цену товара;
- setId(value: string): void - получает id товара;
- setImage(value: string): void - получает изображение товара;
- setCategory(value: string): void - получает категорию товара;
- setTitle(value: string): void - получает название товара;
- setDesciption(value: string): void - получает описание товара;
- setPrice(value: number): void - получает цену товара;

#### Класс CardCatalog
Наследуется от класса `Card`. Добавляет кнопку открытия карточки товара в отдельном окне и устанавливает событие нажатия на неё.

Параметры конструктора:
- container: HTMLElement - скопированный template карточки;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _openButton: HTMLButtonElement - кнопка открытия превью товара.

#### Класс CardPreview
Наследуется от класса `Card`. Добавляет кнопку добавления товара в корзину и устанавливает событие нажатия на неё.

Параметры конструктора:
- container: HTMLElement - скопированный template карточки;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _addToCartButton: HTMLButtonElement - кнопка добавления товара в корзину.

#### Класс CardBasket
Наследуется от класса `Card`. Добавляет кнопку удаления товара из корзины и устанавливает событие нажатия на неё.

Параметры конструктора:
- container: HTMLElement - скопированный template карточки;
- events: IEvents - экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- _removeCardFromCartButton: HTMLButtonElement - кнопка удаления товара из корзины.

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
*События изменения данных (генерируются классами моделями данных)*
- `order:created` - создание заказа

*События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)*
- `card:select` - выбор карточки для отображения в модальном окне;
- `cardPreview:open` - открытие модального окна с формой карточки;
- `cardPreview:moveToBasket` - помещение карточки в корзину;
- `cardBasket:removeFromBasket` - удаление карточки из корзину;
- `basket:open` - открытие модального окна корзины товаров;
- `basket:submit` - начало создания заказа, событие, генерируемое при нажатии кнопки "оформить";
- `orderCheckout:open` - открытие модального окна с формой первой части заказа;
- `orderCheckout:input` - изменение данный в форме первой части заказа;
- `orderCheckout:validation` - событие, сообщающее о необходимости валидации формы первой части заказа;
- `orderCheckout:submit` - событие, генерируемое при нажатии кнопки "далее";
- `orderContacts:open` - открытие модального окна с формой второй части заказа;
- `orderContacts:input` - изменение данный в форме второй части заказа;
- `orderContacts:validation` - событие, сообщающее о необходимости валидации формы второй части заказа;
- `orderContacts:submit` - событие, генерируемое при нажатии кнопки "оплатить";
- `orderResult:open` - открытие модального окна результата отправки заказа;
- `orderResult:submit` - событие, генерируемое при нажатии кнопки "за новыми покупками";
