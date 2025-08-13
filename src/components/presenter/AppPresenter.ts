import { EventEmitter } from "../base/events";
import { ProductModel } from "../models/ProductModel";
import { CartModel } from "../models/CartModel";
import { FormModel } from "../models/FormModel";
import { OrderModel } from "../models/OrderModel";
import { ModalView } from "../views/ModalView";
import { CardView } from "../views/CardView";
import { CardPreviewView } from "../views/CardPreviewView";
import { CartView } from "../views/CartView";
import { OrderFormView } from "../views/OrderFormView";
import { ContactsFormView } from "../views/ContactsFormView";
import { IProduct, IOrder, IOrderResult } from "../../types";
import { ensureElement } from "../../utils/utils";

export class AppPresenter {
    private cartView: CartView;
    private orderFormView: OrderFormView;
    private contactsFormView: ContactsFormView;
    private cardCatalogTemplate: HTMLTemplateElement;
    private cardPreviewTemplate: HTMLTemplateElement;
    private cartItemTemplate: HTMLTemplateElement;
    private orderTemplate: HTMLTemplateElement;
    private contactsTemplate: HTMLTemplateElement;
    private cartButton: HTMLButtonElement;
    private cartCounter: HTMLElement;
    private isCartOpen: boolean = false;

    constructor(
        private events: EventEmitter,
        private productModel: ProductModel,
        private cartModel: CartModel,
        private formModel: FormModel,
        private orderModel: OrderModel,
        private modalView: ModalView
    ) {
        this.cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
        this.cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
        this.cartItemTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
        this.orderTemplate = ensureElement<HTMLTemplateElement>('#order');
        this.contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
        this.cartButton = ensureElement<HTMLButtonElement>('.header__basket');
        this.cartCounter = ensureElement<HTMLElement>('.header__basket-counter');
        
        this.cartView = new CartView(ensureElement<HTMLTemplateElement>('#basket'), events);
        this.orderFormView = new OrderFormView(this.orderTemplate, events);
        this.contactsFormView = new ContactsFormView(this.contactsTemplate, events);

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        // Загрузка продуктов
        this.events.on('products:loaded', (products: IProduct[]) => {
            this.productModel.setProducts(products);
            this.renderProducts(products);
        });

        // Выбор карточки
        this.events.on('card:select', (product: IProduct) => {
            this.productModel.setSelectedProduct(product);
            const preview = new CardPreviewView(this.cardPreviewTemplate, this.events);
            this.modalView.setContent(preview.render(product));
            this.modalView.open();
        });

        // Добавление в корзину
        this.events.on('cart:add', (product: IProduct) => {
            this.cartModel.addItem(product);
            this.updateCartCounter();
            this.modalView.close();
        });

        // Изменение корзины
        this.events.on('cart:changed', () => {
            this.updateCartCounter();
            
            // Обновляем корзину только если она открыта
            if (this.isCartOpen) {
                const cartContent = this.cartView.renderItems(
                    this.cartModel.getItems(), 
                    this.cartItemTemplate
                );
                this.cartView.updateTotal(this.cartModel.getTotal());
                this.modalView.setContent(cartContent);
            }
        });

        // Открытие корзины
        this.cartButton.addEventListener('click', () => {
            this.isCartOpen = true;
            const cartContent = this.cartView.renderItems(
                this.cartModel.getItems(), 
                this.cartItemTemplate
            );
            this.cartView.updateTotal(this.cartModel.getTotal());
            this.modalView.setContent(cartContent);
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
            this.modalView.setContent(this.orderFormView.render(this.formModel.getData()));
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
                this.modalView.setContent(this.contactsFormView.render(this.formModel.getData()));
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
        this.events.on('contacts:submit', () => {
            if (this.formModel.validateContacts()) {
                const orderData: IOrder = {
                    ...this.formModel.getData(),
                    items: this.cartModel.getItems().map(item => item.id),
                    total: this.cartModel.getTotal()
                };
                this.orderModel.submitOrder(orderData);
            } else {
                this.validateContactsForm();
            }
        });

        // Успешное оформление заказа
        this.events.on('order:success', (result: IOrderResult) => {
            this.cartModel.clear();
            this.formModel.reset();
            this.updateCartCounter();
            
            // Показываем окно успеха
            const successTemplate = ensureElement<HTMLTemplateElement>('#success');
            const successContent = successTemplate.content.cloneNode(true) as DocumentFragment;
            const description = successContent.querySelector('.order-success__description');
            if (description) {
                description.textContent = `Списано ${result.total} синапсов`;
            }
            const closeButton = successContent.querySelector('.order-success__close');
            if (closeButton) {
                closeButton.addEventListener('click', () => this.modalView.close());
            }
            
            // Конвертируем DocumentFragment в HTMLElement для установки в модальное окно
            const container = document.createElement('div');
            container.appendChild(successContent);
            this.modalView.setContent(container);
        });
    }

    private validateOrderForm(): void {
        const valid = this.formModel.validateOrder();
        const errors = Object.values(this.formModel.getOrderErrors()).filter(Boolean).join('; ');
        this.orderFormView.setErrors(errors);
        this.orderFormView.setValid(valid);
    }

    private validateContactsForm(): void {
        const valid = this.formModel.validateContacts();
        const errors = Object.values(this.formModel.getContactsErrors()).filter(Boolean).join('; ');
        this.contactsFormView.setErrors(errors);
        this.contactsFormView.setValid(valid);
    }

    private renderProducts(products: IProduct[]): void {
        const gallery = ensureElement<HTMLElement>('.gallery');
        gallery.innerHTML = '';
        
        products.forEach(product => {
            const card = new CardView(this.cardCatalogTemplate, this.events);
            gallery.appendChild(card.render(product));
        });
    }

    private updateCartCounter(): void {
        this.cartCounter.textContent = this.cartModel.getCount().toString();
    }
}