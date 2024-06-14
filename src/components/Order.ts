import { Form } from './common/Form';
import { IOrderForm, TPaymentMethod } from '../types';
import { IEvents } from './base/Events';
import { EventName } from '../utils/constants';

const buttonActiveClass = 'button_alt-active';

export class Order extends Form<IOrderForm> {
	protected _buttonCard: HTMLButtonElement;
	protected _buttonCash: HTMLButtonElement;
  
	constructor(container: HTMLFormElement, protected events: IEvents) {
		super(container, events);

		this._buttonCard = container.elements.namedItem('card') as HTMLButtonElement;
		this._buttonCash = container.elements.namedItem('cash') as HTMLButtonElement;

    this.toggleCard(true);
		this.toggleCash(false);

		if (this._buttonCard) {
			this._buttonCard.addEventListener('click', () => {
				if (!this._buttonCard.classList.contains(buttonActiveClass)) {
          this.toggleCard();
          this.toggleCash();
					events.emit(EventName.orderPaymentCard);
				}
			});
		}

		if (this._buttonCash) {
			this._buttonCash.addEventListener('click', () => {
				if (!this._buttonCash.classList.contains(buttonActiveClass)) {
          this.toggleCard();
          this.toggleCash();
					events.emit(EventName.orderPaymentCash);
				}
			});
		}
	}

	set payment(value: TPaymentMethod) {
    this.toggleCard(value === 'online');
		this.toggleCash(value === 'offline');
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	toggleCard(state?: boolean) {
		if (state) {
			this.toggleClass(this._buttonCard, buttonActiveClass, state);
		} else {
			this.toggleClass(this._buttonCard, buttonActiveClass);
		}
	}

	toggleCash(state?: boolean) {
		if (state) {
			this.toggleClass(this._buttonCash, buttonActiveClass, state);
		} else {
			this.toggleClass(this._buttonCash, buttonActiveClass);
		}
	}
}
