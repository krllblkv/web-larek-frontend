import { ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

export class PageView {
	protected gallery: HTMLElement;
	protected cartButton: HTMLButtonElement;
	protected cartCounter: HTMLElement;
	protected body: HTMLBodyElement;

	constructor(protected events: EventEmitter) {
		this.gallery = ensureElement<HTMLElement>('.gallery');
		this.cartButton = ensureElement<HTMLButtonElement>('.header__basket');
		this.cartCounter = ensureElement<HTMLElement>('.header__basket-counter');
		this.body = document.body as HTMLBodyElement;

		this.cartButton.addEventListener('click', () => {
			events.emit('cart:open');
		});
	}

	renderProducts(products: HTMLElement[]): void {
		this.gallery.replaceChildren(...products);
	}

	updateCartCounter(count: number): void {
		this.cartCounter.textContent = count.toString();
	}

	setLocked(locked: boolean): void {
		this.body.classList.toggle('page__wrapper_locked', locked);
	}
}