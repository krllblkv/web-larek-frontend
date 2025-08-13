 import { ensureElement } from "../../utils/utils";
import { IOrderDetails } from "../../types";
import { EventEmitter } from "../base/events";

export class ContactsFormView {
    protected container: HTMLFormElement;
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;
    protected submitButton: HTMLButtonElement;
    protected errorElement: HTMLElement;

    constructor(template: HTMLTemplateElement, protected events: EventEmitter) {
        this.container = template.content.querySelector('.form')!.cloneNode(true) as HTMLFormElement;
        this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
        this.errorElement = ensureElement<HTMLElement>('.form__errors', this.container);

        // Обработчики событий
        this.emailInput.addEventListener('input', () => {
            this.events.emit('contacts:email', this.emailInput.value);
        });

        this.phoneInput.addEventListener('input', () => {
            this.events.emit('contacts:phone', this.phoneInput.value);
        });

        this.container.addEventListener('submit', (event) => {
            event.preventDefault();
            this.events.emit('contacts:submit');
        });
    }

    setValid(valid: boolean) {
        this.submitButton.disabled = !valid;
    }

    setErrors(errors: string) {
        this.errorElement.textContent = errors;
    }

    render(data: Partial<IOrderDetails>): HTMLElement {
        this.emailInput.value = data.email || '';
        this.phoneInput.value = data.phone || '';
        return this.container;
    }
}