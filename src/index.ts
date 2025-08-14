import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { ApiService } from './services/ApiService';
import { AppPresenter } from './components/presenter/AppPresenter';
import { ProductModel } from './components/models/ProductModel';
import { CartModel } from './components/models/CartModel';
import { FormModel } from './components/models/FormModel';
import { OrderModel } from './components/models/OrderModel';
import { ModalView } from './components/views/ModalView';
import { API_URL, CDN_URL } from './utils/constants';
import { IProduct } from './types';

// Инициализация основных компонентов
const events = new EventEmitter();
const apiService = new ApiService(API_URL, CDN_URL);
const productModel = new ProductModel(events);
const cartModel = new CartModel(events);
const formModel = new FormModel(events);
const orderModel = new OrderModel(events);
const modalView = new ModalView('modal-container', events);

// Инициализация презентера
new AppPresenter(
	events,
	productModel,
	cartModel,
	formModel,
	orderModel,
	modalView,
	apiService
);

// Загрузка продуктов
apiService
	.getProducts()
	.then((products: IProduct[]) => {
		events.emit('products:loaded', products);
	})
	.catch((error) => {
		console.error('Failed to load products:', error);
	});