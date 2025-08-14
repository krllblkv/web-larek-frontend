import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";
import { EventEmitter } from "../base/events";

export class CardView {
    protected container: HTMLElement;
    protected titleElement: HTMLElement;
    protected imageElement: HTMLImageElement;
    protected priceElement: HTMLElement;
    protected categoryElement: HTMLElement;
    protected data: IProduct;

    constructor(template: HTMLTemplateElement, protected events: EventEmitter) {
        this.container = template.content.querySelector('.card')!.cloneNode(true) as HTMLElement;
        this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.priceElement = ensureElement<HTMLElement>('.card__price', this.container);
        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
        
        this.container.addEventListener('click', () => {
            events.emit('card:select', this.data);
        });
    }

    render(data: IProduct, ...args: any[]): HTMLElement {
        this.data = data;
        this.titleElement.textContent = data.title;
        this.imageElement.src = data.image;
        this.imageElement.alt = data.title;
        this.priceElement.textContent = data.price ? `${data.price} синапсов` : 'Бесценно';
        this.setCategory(data.category);
        return this.container;
    }

    private setCategory(category: string) {
        const categoryClasses: Record<string, string> = {
            'софт-скил': 'card__category_soft',
            'хард-скил': 'card__category_hard',
            'другое': 'card__category_other',
            'дополнительное': 'card__category_additional',
            'кнопка': 'card__category_button'
        };
        
        this.categoryElement.textContent = category;
        this.categoryElement.className = 'card__category';
        
        if (categoryClasses[category]) {
            this.categoryElement.classList.add(categoryClasses[category]);
        }
    }
}