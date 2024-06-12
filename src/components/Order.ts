import {Form} from "./common/Form";
import {IOrderForm} from "../types";
import {IEvents} from "./base/events";

export class Order extends Form<IOrderForm> {
  protected _buttonCard: HTMLButtonElement;
  protected _buttonCash: HTMLButtonElement;
  
  constructor(container: HTMLFormElement, protected events: IEvents) {
        super(container, events);

        const buttonActiveClass = 'button_alt-active';

        this._buttonCard = container.elements.namedItem('card') as HTMLButtonElement;
        this._buttonCash = container.elements.namedItem('cash') as HTMLButtonElement;

        this._buttonCard.classList.add(buttonActiveClass);

        if (this._buttonCard) {
          this._buttonCard.addEventListener('click', () => {
            if (!this._buttonCard.classList.contains(buttonActiveClass)) {
              this._buttonCard.classList.toggle(buttonActiveClass);
              this._buttonCash.classList.toggle(buttonActiveClass);
              events.emit('order:paymentCard');
            }
          });
        }

        if (this._buttonCash) {
          this._buttonCash.addEventListener('click', () => {
            if (!this._buttonCash.classList.contains(buttonActiveClass)) {
              this._buttonCard.classList.toggle(buttonActiveClass);
              this._buttonCash.classList.toggle(buttonActiveClass);
              events.emit('order:paymentCash');
            }
          });
        }
    }

    set adress(value: string) {
      (this.container.elements.namedItem('adress') as HTMLInputElement).value = value;
    }
}