import { EventEmitter } from "../base/events";
import { IOrder, IOrderResult } from "../../types";
import { ApiService } from "../../services/ApiService";

export class OrderModel {
    constructor(
        protected events: EventEmitter,
        protected apiService: ApiService
    ) {}

    async submitOrder(order: IOrder): Promise<IOrderResult> {
        try {
            const result = await this.apiService.submitOrder(order);
            this.events.emit('order:success', result);
            return result;
        } catch (error) {
            this.events.emit('order:error', error);
            throw error;
        }
    }
}