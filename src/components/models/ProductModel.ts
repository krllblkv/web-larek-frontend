import { EventEmitter } from "../base/events";
import { IProduct } from "../../types";

export class ProductModel {
    private products: IProduct[] = [];
    private selectedProduct: IProduct | null = null;

    constructor(protected events: EventEmitter) {}

    setProducts(products: IProduct[]): void {
        this.products = products;
        this.events.emit('products:changed');
    }

    getProducts(): IProduct[] {
        return this.products;
    }

    setSelectedProduct(product: IProduct): void {
        this.selectedProduct = product;
        this.events.emit('product:selected', product);
    }

    getSelectedProduct(): IProduct | null {
        return this.selectedProduct;
    }
}