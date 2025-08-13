import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";
import { CartItemView } from "./CartItemView";
import { EventEmitter } from "../base/events";

export class CartView {
    protected container: HTMLElement;
    protected listElement: HTMLElement;
    protected totalElement: HTMLElement;
    protected buttonElement: HTMLButtonElement;

    constructor(template: HTMLTemplateElement, protected events: EventEmitter) {
        this.container = template.content.querySelector('.basket')!.cloneNode(true) as HTMLElement;
        this.listElement = ensureElement<HTMLElement>('.basket__list', this.container);
        this.totalElement = ensureElement<HTMLElement>('.basket__price', this.container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.basket__button', this.container);
        
        // Добавляем обработчик для кнопки оформления заказа
        this.buttonElement.addEventListener('click', () => {
            events.emit('order:open');
        });
    }

    updateTotal(total: number): void {
        this.totalElement.textContent = `${total} синапсов`;
    }

    renderItems(items: IProduct[], template: HTMLTemplateElement): HTMLElement {
        this.listElement.innerHTML = '';
        
        if (items.length === 0) {
            this.listElement.innerHTML = '<p>Корзина пуста</p>';
            this.buttonElement.disabled = true;
            return this.container;
        }
        
        this.buttonElement.disabled = false;
        
        items.forEach((item, index) => {
            const cartItem = new CartItemView(template, this.events);
            this.listElement.appendChild(cartItem.render(item, index + 1));
        });
        
        return this.container;
    }
}