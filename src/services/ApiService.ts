import { Api, ApiListResponse } from '../components/base/api';
import { IProduct, IOrder, IOrderResult } from '../types';

export class ApiService extends Api {
	constructor(baseUrl: string, private cdnUrl: string) {
		super(baseUrl);
	}

	async getProducts(): Promise<IProduct[]> {
		const response = (await this.get('/product')) as ApiListResponse<IProduct>;
		return response.items.map((item) => ({
			...item,
			image: this.cdnUrl + item.image,
		}));
	}

	async submitOrder(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order) as Promise<IOrderResult>;
	}
}