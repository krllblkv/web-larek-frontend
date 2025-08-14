import { EventEmitter } from '../base/events';
import { IOrderDetails, FormValidationErrors } from '../../types';

export class FormModel {
	private data: IOrderDetails = {
		payment: '',
		address: '',
		email: '',
		phone: '',
	};

	private orderErrors: FormValidationErrors = {};
	private contactsErrors: FormValidationErrors = {};

	constructor(protected events: EventEmitter) {}

	setField(field: keyof IOrderDetails, value: string): void {
		this.data[field] = value;
		this.events.emit('form:changed');
	}

	// Универсальный метод валидации полей
	private validateField(
		field: keyof IOrderDetails,
		value: string
	): string | null {
		switch (field) {
			case 'payment':
				return value ? null : 'Выберите способ оплаты';

			case 'address':
				return value && value.trim().length >= 5
					? null
					: 'Введите корректный адрес (минимум 5 символов)';

			case 'email':
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return value && emailRegex.test(value)
					? null
					: 'Введите корректный email';

			case 'phone':
				const phoneRegex = /^\+?[0-9]{10,15}$/;
				return value && phoneRegex.test(value)
					? null
					: 'Введите корректный телефон (10-15 цифр)';

			default:
				return null;
		}
	}

	validateOrder(): boolean {
		this.orderErrors = {};
		let valid = true;

		const fields: (keyof IOrderDetails)[] = ['payment', 'address'];
		fields.forEach((field) => {
			const error = this.validateField(field, this.data[field]);
			if (error) {
				this.orderErrors[field] = error;
				valid = false;
			}
		});

		return valid;
	}

	validateContacts(): boolean {
		this.contactsErrors = {};
		let valid = true;

		const fields: (keyof IOrderDetails)[] = ['email', 'phone'];
		fields.forEach((field) => {
			const error = this.validateField(field, this.data[field]);
			if (error) {
				this.contactsErrors[field] = error;
				valid = false;
			}
		});

		return valid;
	}

	getData(): IOrderDetails {
		return this.data;
	}

	getOrderErrors(): FormValidationErrors {
		return this.orderErrors;
	}

	getContactsErrors(): FormValidationErrors {
		return this.contactsErrors;
	}

	reset(): void {
		this.data = {
			payment: '',
			address: '',
			email: '',
			phone: '',
		};
		this.orderErrors = {};
		this.contactsErrors = {};
	}
}