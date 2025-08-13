import { ensureElement } from "../../utils/utils";
import { EventEmitter } from "../base/events";

export class ModalView {
    protected container: HTMLElement;
    protected contentElement: HTMLElement;
    protected closeButton: HTMLButtonElement;

    constructor(containerId: string, protected events: EventEmitter) {
        this.container = ensureElement<HTMLElement>(`#${containerId}`);
        this.contentElement = ensureElement<HTMLElement>('.modal__content', this.container);
        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);
        
        this.closeButton.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', this.handleOutsideClick.bind(this));
        this.contentElement.addEventListener('click', (event) => event.stopPropagation());
    }

    open(): void {
        this.container.classList.add('modal_active');
        document.body.classList.add('page__wrapper_locked');
        this.events.emit('modal:open');
    }

    close(): void {
        this.container.classList.remove('modal_active');
        document.body.classList.remove('page__wrapper_locked');
        this.contentElement.innerHTML = '';
        this.events.emit('modal:close');
    }

    setContent(content: HTMLElement): void {
        this.contentElement.innerHTML = '';
        this.contentElement.appendChild(content);
    }

    private handleOutsideClick(event: MouseEvent): void {
        if (event.target === this.container) {
            this.close();
        }
    }

    isOpen(): boolean {
        return this.container.classList.contains('modal_active');
    }
}