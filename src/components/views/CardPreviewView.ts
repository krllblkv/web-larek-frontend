import { ensureElement } from '../../utils/utils';
import { IProduct } from '../../types';
import { CardView } from './CardView';
import { EventEmitter } from '../base/events';

export class CardPreviewView extends CardView {
	protected descriptionElement: HTMLElement;
	protected buttonElement: HTMLButtonElement | null;

	constructor(template: HTMLTemplateElement, events: EventEmitter) {
		super(template, events);
		this.descriptionElement = ensureElement<HTMLElement>(
			'.card__text',
			this.container
		);
		this.buttonElement = this.container.querySelector('.card__button');
	}

	render(data: IProduct, inCart: boolean): HTMLElement {
		super.render(data); // Вызываем базовый метод
		this.descriptionElement.textContent = data.description;

		if (this.buttonElement) {
			// Удаляем предыдущие обработчики
			this.buttonElement.onclick = null;

			if (inCart) {
				this.buttonElement.textContent = 'Удалить из корзины';
				this.buttonElement.disabled = false;
				this.buttonElement.onclick = () => {
					this.events.emit('cart:remove', data.id);
				};
			} else {
				this.buttonElement.textContent = data.price
					? 'В корзину'
					: 'Не продается';
				this.buttonElement.disabled = !data.price;
				if (data.price) {
					this.buttonElement.onclick = () => {
						this.events.emit('cart:add', data);
					};
				}
			}
		}
		return this.container;
	}
}