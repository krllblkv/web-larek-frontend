import { ensureElement } from '../../utils/utils';
import { IProduct } from '../../types';
import { EventEmitter } from '../base/events';

export class CartItemView {
	protected container: HTMLElement;
	protected indexElement: HTMLElement;
	protected titleElement: HTMLElement;
	protected priceElement: HTMLElement;
	protected deleteButton: HTMLButtonElement;

	constructor(template: HTMLTemplateElement, protected events: EventEmitter) {
		this.container = template.content
			.querySelector('.basket__item')!
			.cloneNode(true) as HTMLElement;
		this.indexElement = ensureElement<HTMLElement>(
			'.basket__item-index',
			this.container
		);
		this.titleElement = ensureElement<HTMLElement>(
			'.card__title',
			this.container
		);
		this.priceElement = ensureElement<HTMLElement>(
			'.card__price',
			this.container
		);
		this.deleteButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			this.container
		);

		this.deleteButton.addEventListener('click', (event) => {
			event.stopPropagation();
			if (this.container.dataset.id) {
				events.emit('cart:remove', this.container.dataset.id);
			}
		});
	}

	render(item: IProduct, index: number): HTMLElement {
		this.indexElement.textContent = index.toString();
		this.titleElement.textContent = item.title;
		this.priceElement.textContent = item.price
			? `${item.price} синапсов`
			: 'Бесценно';
		this.container.dataset.id = item.id;
		return this.container;
	}
}