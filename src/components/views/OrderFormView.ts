import { ensureElement } from '../../utils/utils';
import { IOrderDetails } from '../../types';
import { EventEmitter } from '../base/events';

export class OrderFormView {
	protected container: HTMLFormElement;
	protected paymentButtons: HTMLButtonElement[];
	protected addressInput: HTMLInputElement;
	protected submitButton: HTMLButtonElement;
	protected errorElement: HTMLElement;

	constructor(template: HTMLTemplateElement, protected events: EventEmitter) {
		this.container = template.content
			.querySelector('.form')!
			.cloneNode(true) as HTMLFormElement;
		this.paymentButtons = Array.from(
			this.container.querySelectorAll('.button_alt')
		);
		this.addressInput = ensureElement<HTMLInputElement>(
			'input[name="address"]',
			this.container
		);
		this.submitButton = ensureElement<HTMLButtonElement>(
			'button[type="submit"]',
			this.container
		);
		this.errorElement = ensureElement<HTMLElement>(
			'.form__errors',
			this.container
		);

		// Обработчики событий для кнопок оплаты
		this.paymentButtons.forEach((button) => {
			button.addEventListener('click', () => {
				// Снимаем выделение со всех кнопок
				this.paymentButtons.forEach((btn) =>
					btn.classList.remove('button_alt-active')
				);
				// Выделяем текущую кнопку
				button.classList.add('button_alt-active');
				// Генерируем событие
				this.events.emit('order:payment', button.name);
			});
		});

		// Обработчик ввода адреса
		this.addressInput.addEventListener('input', () => {
			this.events.emit('order:address', this.addressInput.value);
		});

		// Обработчик отправки формы
		this.container.addEventListener('submit', (event) => {
			event.preventDefault();
			this.events.emit('order:submit');
		});
	}

	setValid(valid: boolean) {
		this.submitButton.disabled = !valid;
	}

	setErrors(errors: string) {
		this.errorElement.textContent = errors;
	}

	render(data: Partial<IOrderDetails>): HTMLElement {
		if (data.payment) {
			// Найдем кнопку с соответствующим именем и выделим ее
			const button = this.paymentButtons.find(
				(btn) => btn.name === data.payment
			);
			if (button) {
				this.paymentButtons.forEach((btn) =>
					btn.classList.remove('button_alt-active')
				);
				button.classList.add('button_alt-active');
			}
		}
		this.addressInput.value = data.address || '';
		return this.container;
	}
}