export type SelectedItem = {
  _id: string;
  name: string;
  productCode: string;
  description: string;
  price: number;
  stock: number;
  qty: number;
};

export type ProductList = {
  _id: string;
  productId: string;
  productCode: string;
  name: string,
  quantity: number;
  totalPrice: number;
};

export type Address = {
  name: string;
  detail: string;
  province: string;
  district: string;
  subdistrict: string;
  postcode: string;
  contact: string;
}

export type OrderItem = {
  productId: string; 
  productCode: string; 
  name: string;
  quantity: number;
  totalPrice: number;
}

export type Order = {
  _id: string;
  shopId: string;
  orderNumber: string;
  orderItem: OrderItem[];
  status: string;
  shopAddress: Address;
  customerAddress: Address;
  paymentMethod: string;
  delivery: string;
  orderDate: Date;
  totalPrice: number;
  isDeleted: boolean;
}