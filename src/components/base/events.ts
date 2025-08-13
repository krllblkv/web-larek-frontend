type EventName = string | RegExp;
type Subscriber = Function;

export interface IEvents {
    on<T>(event: EventName, callback: (data: T) => void): void;
    emit<T>(event: string, data?: T): void;
}

export class EventEmitter implements IEvents {
    private _events: Map<EventName, Set<Subscriber>>;

    constructor() {
        this._events = new Map<EventName, Set<Subscriber>>();
    }

    on<T>(eventName: EventName, callback: (data: T) => void) {
        if (!this._events.has(eventName)) {
            this._events.set(eventName, new Set<Subscriber>());
        }
        this._events.get(eventName)?.add(callback);
    }

    off(eventName: EventName, callback: Subscriber) {
        if (this._events.has(eventName)) {
            const subscribers = this._events.get(eventName);
            if (subscribers) {
                subscribers.delete(callback);
                if (subscribers.size === 0) {
                    this._events.delete(eventName);
                }
            }
        }
    }

    emit<T>(eventName: string, data?: T) {
        this._events.forEach((subscribers, name) => {
            if (name instanceof RegExp && name.test(eventName) || name === eventName) {
                subscribers.forEach(callback => callback(data));
            }
        });
    }
}