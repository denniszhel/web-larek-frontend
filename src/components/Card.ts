import { Component } from "./base/Component";
import { ICard } from "../types";
import { ensureElement } from "../utils/utils";

interface ICardOptions {
  onClick: (event: MouseEvent) => void;
  onClickButton: 'open' | 'basket' | 'delete';
  basketIndex?: number;
  itemInBasket?: boolean;
}

export class Card extends Component<ICard> {
  protected _basketItemIndex?: HTMLElement;
  protected _title: HTMLElement;
  protected _category?: HTMLElement;
  protected _image?: HTMLImageElement;
  protected _description: HTMLElement;
  protected _price: HTMLElement;
  protected _button: HTMLButtonElement;

  // описания категории
  protected _categoryColor = <Record<string, string>> { 
    "софт-скил": "soft",
    "другое": "other",
    "дополнительное": "additional",
    "кнопка": "button",
    "хард-скил": "hard"
  }

  constructor(container: HTMLElement | HTMLButtonElement, options?: ICardOptions) {
    super(container);
    this._title = ensureElement<HTMLElement>('.card__title', container);
    this._image = container.querySelector('.card__image');
    this._category = container.querySelector('.card__category');
    this._price = ensureElement<HTMLElement>('.card__price', container);
    if (options) {
      if ('basketIndex' in options && options.basketIndex) {
        this._basketItemIndex = container.querySelector('.basket__item-index');
        this.setText(this._basketItemIndex, options.basketIndex.toString());
      }
      if (options.onClickButton === 'open') {
        this._button = container as HTMLButtonElement;
      } else if (options.onClickButton === 'basket') {
        this._button = container.querySelector('.card__button');
      } else {
        this._button = container.querySelector('.basket__item-delete');
      }
      this._button.addEventListener('click', options.onClick);
      this.setDisabled(this._button, 'itemInBasket' in options && options.itemInBasket);
    }  
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }

  get id(): string {
      return this.container.dataset.id || '';
  }

  set title(value: string) {
      this.setText(this._title, value);
  }

  get title(): string {
      return this._title.textContent || '';
  }

  set category(value: string) {
    this.setText(this._category, value);
    this.toggleClass(this._category, `card__category_${this._categoryColor[value]}`, true)
  }

  get category(): string {
      return this._category.textContent || '';
  }

  set description(value: string) {
    this.setText(this._description, value);
  }

  get description(): string {
      return this._description.textContent || '';
  }
  
  set price(value: string | null) {
    this.setText(this._price, value === null ? 'Бесценно' : `${value} синапсов`);
  }

  get price(): number {
      return Number(this._price.textContent || '0');
  }
  
  set image(value: string) {
      this.setImage(this._image, value, this.title)
  }

}