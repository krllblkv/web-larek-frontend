import { EventEmitter } from "../base/events";

export class OrderModel {
    constructor(protected events: EventEmitter) {}
}