import { EventEmitter } from '../base/events';
import { IProduct } from '../../types';

export class CartModel {
	private items: IProduct[] = [];

	constructor(protected events: EventEmitter) {}

	addItem(item: IProduct): void {
		// Проверяем, нет ли уже товара в корзине
		if (!this.items.some((i) => i.id === item.id)) {
			this.items.push(item);
			this.events.emit('cart:changed');
		}
	}

	removeItem(itemId: string): void {
		this.items = this.items.filter((item) => item.id !== itemId);
		this.events.emit('cart:changed');
	}

	clear(): void {
		this.items = [];
		this.events.emit('cart:changed');
	}

	getItems(): IProduct[] {
		return this.items;
	}

	getTotal(): number {
		return this.items.reduce((total, item) => total + (item.price || 0), 0);
	}

	getCount(): number {
		return this.items.length;
	}
}