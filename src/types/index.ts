export interface IProduct {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    price: number | null;
}

export interface IOrderDetails {
    payment: string;
    address: string;
    email: string;
    phone: string;
}

export interface IOrder extends IOrderDetails {
    items: string[];
    total: number;
}

export interface IOrderResult {
    id: string;
    total: number;
}

export interface FormErrors {
    payment?: string;
    address?: string;
    email?: string;
    phone?: string;
}

export type FormValidationErrors = Partial<Record<keyof IOrderDetails, string>>;

export interface IComponentActions {
    onClick?: (event: MouseEvent) => void;
}