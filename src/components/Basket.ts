import { Component } from "./base/Component";
import { createElement, ensureElement, formatNumber } from "../utils/utils";
import { IEvents } from "./base/Events";
import { EventName } from "../utils/constants"

interface IBasketView {
    items: HTMLElement[];
    total: number;
}

export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._total = ensureElement<HTMLElement>('.basket__price', container);
        this._button = ensureElement<HTMLButtonElement>('.basket__button', container);
        
        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit(EventName.orderOpen);
            });
        }

        this.items = [];
    }

    set items(items: HTMLElement[]) {
        if (items.length) {
            this._list.replaceChildren(...items);
            this.setDisabled(this._button, false);
        } else {
            this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'
            }));
            this.setDisabled(this._button, true);
        }
    }

    set selected(items: string[]) {
        if (items.length) {
            this.toggleButton(false);
        } else {
            this.toggleButton(true);
        }
    }

    set total(total: number) {
        this.setText(this._total, `${formatNumber(total)} синапсов`);
        this.toggleButton(total === 0);
    }

    toggleButton(state: boolean) {
        this.setDisabled(this._button, state);
    }
}