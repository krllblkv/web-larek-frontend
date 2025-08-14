import { EventEmitter } from '../base/events';
import { ProductModel } from '../models/ProductModel';
import { CartModel } from '../models/CartModel';
import { FormModel } from '../models/FormModel';
import { OrderModel } from '../models/OrderModel';
import { ModalView } from '../views/ModalView';
import { CardView } from '../views/CardView';
import { CardPreviewView } from '../views/CardPreviewView';
import { CartView } from '../views/CartView';
import { CartItemView } from '../views/CartItemView';
import { OrderFormView } from '../views/OrderFormView';
import { ContactsFormView } from '../views/ContactsFormView';
import { PageView } from '../views/PageView';
import { IProduct, IOrder, IOrderResult } from '../../types';
import { ensureElement } from '../../utils/utils';
import { ApiService } from '../../services/ApiService';

export class AppPresenter {
	private pageView: PageView;
	private cartView: CartView;
	private orderFormView: OrderFormView;
	private contactsFormView: ContactsFormView;
	private cardCatalogTemplate: HTMLTemplateElement;
	private cardPreviewTemplate: HTMLTemplateElement;
	private cartItemTemplate: HTMLTemplateElement;
	private isCartOpen: boolean = false;

	constructor(
		private events: EventEmitter,
		private productModel: ProductModel,
		private cartModel: CartModel,
		private formModel: FormModel,
		private orderModel: OrderModel,
		private modalView: ModalView,
		private apiService: ApiService
	) {
		this.pageView = new PageView(events);
		this.cartView = new CartView(events);
		this.orderFormView = new OrderFormView(
			ensureElement<HTMLTemplateElement>('#order'),
			events
		);
		this.contactsFormView = new ContactsFormView(
			ensureElement<HTMLTemplateElement>('#contacts'),
			events
		);
		this.cardCatalogTemplate =
			ensureElement<HTMLTemplateElement>('#card-catalog');
		this.cardPreviewTemplate =
			ensureElement<HTMLTemplateElement>('#card-preview');
		this.cartItemTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

		this.setupEventHandlers();
	}

	private setupEventHandlers(): void {
		// Загрузка продуктов
		this.events.on('products:loaded', (products: IProduct[]) => {
			this.productModel.setProducts(products);
			const productElements = products.map((product) => {
				const card = new CardView(this.cardCatalogTemplate, this.events);
				return card.render(product);
			});
			this.pageView.renderProducts(productElements);
		});

		// Выбор карточки
		this.events.on('card:select', (product: IProduct) => {
			this.productModel.setSelectedProduct(product);
			const preview = new CardPreviewView(
				this.cardPreviewTemplate,
				this.events
			);

			// Проверяем, есть ли товар в корзине
			const inCart = this.cartModel
				.getItems()
				.some((item) => item.id === product.id);

			this.modalView.setContent(preview.render(product, inCart));
			this.modalView.open();
		});

		// Добавление в корзину
		this.events.on('cart:add', (product: IProduct) => {
			this.cartModel.addItem(product);
			this.pageView.updateCartCounter(this.cartModel.getCount());
			this.modalView.close();
		});

		// Изменение корзины
		this.events.on('cart:changed', () => {
			this.pageView.updateCartCounter(this.cartModel.getCount());

			if (this.isCartOpen) {
				const cartItems = this.cartModel.getItems().map((item, index) => {
					const cartItem = new CartItemView(this.cartItemTemplate, this.events);
					return cartItem.render(item, index + 1);
				});
				this.cartView.setItems(cartItems);
				this.cartView.updateTotal(this.cartModel.getTotal());

				// Обновляем корзину, но не меняем содержимое, если уже показываем корзину
				if (this.modalView.isOpen()) {
					// Проверяем, что текущее содержимое - это корзина
					if (this.modalView.containsClass('basket')) {
						this.modalView.setContent(this.cartView.getContainer());
					}
				}
			}

			// Обновляем превью товара, если оно открыто и корзина не открыта
			const selectedProduct = this.productModel.getSelectedProduct();
			if (this.modalView.isOpen() && selectedProduct && !this.isCartOpen) {
				const preview = new CardPreviewView(
					this.cardPreviewTemplate,
					this.events
				);
				const inCart = this.cartModel
					.getItems()
					.some((item) => item.id === selectedProduct.id);
				this.modalView.setContent(preview.render(selectedProduct, inCart));
			}
		});

		// Открытие корзины
		this.events.on('cart:open', () => {
			this.isCartOpen = true;
			const cartItems = this.cartModel.getItems().map((item, index) => {
				const cartItem = new CartItemView(this.cartItemTemplate, this.events);
				return cartItem.render(item, index + 1);
			});
			this.cartView.setItems(cartItems);
			this.cartView.updateTotal(this.cartModel.getTotal());
			this.modalView.setContent(this.cartView.getContainer());
			this.modalView.open();
		});

		// Закрытие модального окна
		this.events.on('modal:close', () => {
			this.isCartOpen = false;
		});

		// Удаление из корзины
		this.events.on('cart:remove', (itemId: string) => {
			this.cartModel.removeItem(itemId);
		});

		// Обработка оформления заказа
		this.events.on('order:open', () => {
			this.formModel.reset();
			this.modalView.setContent(
				this.orderFormView.render(this.formModel.getData())
			);
			this.modalView.open();
			this.validateOrderForm();
		});

		// Обновление данных заказа
		this.events.on('order:payment', (payment: string) => {
			this.formModel.setField('payment', payment);
			this.validateOrderForm();
		});

		this.events.on('order:address', (address: string) => {
			this.formModel.setField('address', address);
			this.validateOrderForm();
		});

		// Переход к контактам
		this.events.on('order:submit', () => {
			if (this.formModel.validateOrder()) {
				this.modalView.setContent(
					this.contactsFormView.render(this.formModel.getData())
				);
				this.validateContactsForm();
			} else {
				this.validateOrderForm();
			}
		});

		// Обновление контактных данных
		this.events.on('contacts:email', (email: string) => {
			this.formModel.setField('email', email);
			this.validateContactsForm();
		});

		this.events.on('contacts:phone', (phone: string) => {
			this.formModel.setField('phone', phone);
			this.validateContactsForm();
		});

		// Отправка заказа
		this.events.on('contacts:submit', async () => {
			if (this.formModel.validateContacts()) {
				const orderData: IOrder = {
					...this.formModel.getData(),
					items: this.cartModel.getItems().map((item) => item.id),
					total: this.cartModel.getTotal(),
				};

				try {
					const result = await this.apiService.submitOrder(orderData);
					this.events.emit('order:success', result);
				} catch (error) {
					this.events.emit('order:error', error);
				}
			} else {
				this.validateContactsForm();
			}
		});

		// Успешное оформление заказа
		this.events.on('order:success', (result: IOrderResult) => {
			this.cartModel.clear();
			this.formModel.reset();
			this.pageView.updateCartCounter(0);

			const successTemplate = ensureElement<HTMLTemplateElement>('#success');
			const successContent = successTemplate.content.cloneNode(
				true
			) as DocumentFragment;
			const description = successContent.querySelector(
				'.order-success__description'
			);
			if (description) {
				description.textContent = `Списано ${result.total} синапсов`;
			}

			const container = document.createElement('div');
			container.appendChild(successContent);

			// Добавляем обработчик для кнопки закрытия
			const closeButton = container.querySelector('.order-success__close');
			if (closeButton) {
				closeButton.addEventListener('click', () => {
					this.modalView.close();
				});
			}

			this.modalView.setContent(container);
		});

		// Блокировка страницы при открытии модального окна
		this.events.on('modal:open', () => {
			this.pageView.setLocked(true);
		});

		this.events.on('modal:close', () => {
			this.pageView.setLocked(false);
		});
	}

	private validateOrderForm(): void {
		const valid = this.formModel.validateOrder();
		const errors = Object.values(this.formModel.getOrderErrors())
			.filter(Boolean)
			.join('; ');
		this.orderFormView.setErrors(errors);
		this.orderFormView.setValid(valid);
	}

	private validateContactsForm(): void {
		const valid = this.formModel.validateContacts();
		const errors = Object.values(this.formModel.getContactsErrors())
			.filter(Boolean)
			.join('; ');
		this.contactsFormView.setErrors(errors);
		this.contactsFormView.setValid(valid);
	}
}