import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";
import { CardView } from "./CardView";
import { EventEmitter } from "../base/events";

export class CardPreviewView extends CardView {
    protected descriptionElement: HTMLElement;
    protected buttonElement: HTMLButtonElement | null;

    constructor(template: HTMLTemplateElement, events: EventEmitter) {
        super(template, events);
        this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
        this.buttonElement = this.container.querySelector('.card__button');
        
        if (this.buttonElement) {
            this.buttonElement.addEventListener('click', () => {
                if (this.data.price) {
                    events.emit('cart:add', this.data);
                }
            });
        }
    }
    
    render(data: IProduct): HTMLElement {
        super.render(data);
        this.descriptionElement.textContent = data.description;
        if (this.buttonElement) {
            this.buttonElement.textContent = data.price ? 'В корзину' : 'Не продается';
            this.buttonElement.disabled = !data.price;
        }
        return this.container;
    }
}