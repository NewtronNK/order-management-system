export interface OrderItem {
  _id: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  [key: string]: any;
}

export interface OrderPayload {
  shopId: string;
  orderItem: OrderItem[];
  shopAddress: any;
  customerAddress: any;
  paymentMethod: string;
  delivery: string;
  orderDate?: Date;
  [key: string]: any;
}

export interface Order {
  _id: string;
  shopId: string;
  orderItem: OrderItem[];
  status: string;
  [key: string]: any;
}

export interface OrderSearchParams {
  shopId: string;
  text?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}