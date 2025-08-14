WEB-ларёк: Интернет-магазин для веб-разработчиков

Проект реализован по архитектуре MVP (Model-View-Presenter) с использованием TypeScript.

Стек технологий

- TypeScript
- SCSS
- Webpack
- HTML5
- MVP-архитектура
- Event-driven подход

Запуск проекта:

- Создайте файл `.env` в корне проекта:
  API_ORIGIN=https://larek-api.nomoreparties.co

- Установите зависимости:
  npm install

- Запустите dev-сервер:
  npm run start

- Для production-сборки:
  npm run build

Архитектура проекта

MVP-паттерн

Проект реализован по архитектуре MVP (Model-View-Presenter) с использованием брокера событий для связи компонентов:

Model (бизнес-логика и данные):
ProductModel - управление продуктами
CartModel - управление корзиной
FormModel - валидация форм
OrderModel - обработка заказов

View (отображение):
PageView - главная страница приложения
CardView - карточка товара
CardPreviewView - детали товара
CartView - корзина
ModalView - модальные окна
OrderFormView - форма заказа
ContactsFormView - форма контактов

Presenter (посредник):
AppPresenter - связывает Model и View, обрабатывает события

Базовые классы

EventEmitter

Реализует брокер событий для связи компонентов:

class EventEmitter {
on<T>(eventName: EventName, callback: (data: T) => void): void;
emit<T>(eventName: string, data?: T): void;
off(eventName: EventName, callback: Subscriber): void;
}

Api

Базовый класс для работы с API:

class Api {
get(uri: string): Promise<object>;
post(uri: string, data: object, method: ApiPostMethods): Promise<object>;
}

Компоненты:

Модели (Model)
Класс: ProductModel
Описание: Управление продуктами и выбором товара
Собития: products:changed, product:selected

Класс: CartModel
Описание: Управление корзиной (добавление/удаление)
Собития: cart:changed

Класс: FormModel
Описание: Валидация данных формы
Собития:form:changed

Класс: OrderModel
Описание: Оформление заказов

Представления (View)
Класс: PageView
Описание: Главная страница приложения
Собития: cart:open

Класс: CardView
Описание: Отображение товара в каталоге
Собития: card:select

Класс: CardPreviewView
Описание: Детальное отображение товара
Собития: cart:add

Класс: CartView
Описание: Отображение корзины
Собития: order:open

Класс: ModalView
Описание: Управление модальными окнами
Собития: modal:open, modal:close

Класс: OrderFormView
Описание: Форма заказа (оплата и адрес)
Собития: order:payment, order:address, order:submit

Класс: ContactsFormView
Описание: Форма контактов
Собития: contacts:email, contacts:phone, contacts:submit

Презентер
AppPresenter - центральный компонент, который:

- Инициализирует все компоненты
- Подписывается на события
- Координирует взаимодействие между Model и View
- Управляет потоком данных
- Выполняет вызовы API

Типы данных

Основные типы данных в проекте:

// Товар
interface IProduct {
id: string;
title: string;
description: string;
image: string;
category: string;
price: number | null;
}

// Данные заказа
interface IOrderDetails {
payment: string;
address: string;
email: string;
phone: string;
}

// Полный заказ
interface IOrder extends IOrderDetails {
items: string[];
total: number;
}

// Результат оформления заказа
interface IOrderResult {
id: string;
total: number;
}

// Ошибки валидации
export type FormValidationErrors = Partial<Record<keyof IOrderDetails, string>>;

Взаимодействие компонентов

Просмотр каталога:

- ApiService загружает продукты
- ProductModel сохраняет продукты
- PageView отображает продукты через CardView

Работа с корзиной:
Добавление:

- CardPreviewView генерирует cart:add
- CartModel добавляет товар
  Удаление:
- CartItemView генерирует cart:remove
- CartModel удаляет товар

Оформление заказа:

- CartView генерирует order:open
- OrderFormView отображает форму заказа

При заполнении формы генерируются события:

- order:payment - выбор способа оплаты
- order:address - ввод адреса
- order:submit - отправка формы

FormModel валидирует данные

При успешной валидации открывается ContactsFormView

После заполнения контактов генерируется contacts:submit

AppPresenter отправляет заказ через ApiService

При успешном оформлении показывается окно подтверждения

Событийная модель

Основные события в приложении:
products:loaded - Загрузка продуктов
card:select - Выбор карточки товара
cart:add - Добавление товара в корзину
cart:remove - Удаление товара из корзины
cart:changed - Изменение состояния корзины
order:open - Открытие формы заказа
order:payment - Выбор способа оплаты
order:address - Ввод адреса доставки
order:submit - Отправка формы заказа
contacts:email - Ввод email
contacts:phone - Ввод телефона
contacts:submit - Отправка контактных данных
modal:open - Открытие модального окна
modal:close - Закрытие модального окна
order:success - Успешное оформление заказа
order:error - Ошибка оформления заказа

Структура проекта

src/
├── components/
│ ├── base/ # Базовые классы (EventEmitter, Api)
│ ├── models/ # Модели данных (CartModel, ProductModel и т.д.)
│ ├── presenter/ # Презентер (AppPresenter)
│ ├── views/ # Представления (CardView, ModalView и т.д.)
│ └── services/ # Сервисы (ApiService)
├── pages/ # HTML-страницы
├── scss/ # Стили
├── types/ # Типы данных
├── utils/ # Утилиты
└── index.ts # Точка входа
