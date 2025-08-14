import { ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

export class CartView {
	protected container: HTMLElement;
	protected listElement: HTMLElement;
	protected totalElement: HTMLElement;
	protected buttonElement: HTMLButtonElement;

	constructor(protected events: EventEmitter) {
		const template = ensureElement<HTMLTemplateElement>('#basket');
		this.container = template.content
			.querySelector('.basket')!
			.cloneNode(true) as HTMLElement;
		this.listElement = ensureElement<HTMLElement>(
			'.basket__list',
			this.container
		);
		this.totalElement = ensureElement<HTMLElement>(
			'.basket__price',
			this.container
		);
		this.buttonElement = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.container
		);

		this.buttonElement.addEventListener('click', () => {
			events.emit('order:open');
		});
	}

	setItems(items: HTMLElement[]): void {
		this.listElement.replaceChildren(...items);
	}

	updateTotal(total: number): void {
		this.totalElement.textContent = `${total} синапсов`;
	}

	setButtonState(disabled: boolean): void {
		this.buttonElement.disabled = disabled;
	}

	getContainer(): HTMLElement {
		return this.container;
	}
}