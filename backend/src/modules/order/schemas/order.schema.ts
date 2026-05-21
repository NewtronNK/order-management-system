import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;
export enum Status {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  ONDELIVERY = 'on delivery',
  PACKAGEPROBLEM = 'package problem',
  SUCCESS = 'success',
  BOUNCEBACK = 'bounce back',
  CANCEL = 'cancel',
}
export enum Payment {
  QRPAYMENT = 'QR Payment',
  CASH = 'cash on delivery',
  BANK = 'bank transfer',
}

@Schema({ _id: false })
class Address {
  @Prop()
  name?: string;

  @Prop({ default: '?' })
  detail?: string;

  @Prop()
  province?: string;

  @Prop()
  district?: string;

  @Prop()
  subdistrict?: string;

  @Prop()
  postcode?: string;

  @Prop()
  contact?: string;
}
const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ _id: false })
class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId; // FK → Product._id

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  totalPrice: number; // one type of product total price ex. 2 pairs of shoes = 2400 Baht
}
const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Shop', required: true })
  shopId: Types.ObjectId; // FK → Shop._id (one Shop can own many orders)

  @Prop({ unique: true })
  orderNumber: string;

  @Prop({ type: [OrderItemSchema], required: true })
  orderItem: OrderItem[];

  @Prop({
    type: String,
    enum: Status,
    default: Status.DRAFT,
  })
  status?: string;

  @Prop({ type: AddressSchema })
  shopAddress?: Address;

  @Prop({ type: AddressSchema })
  customerAddress?: Address;

  @Prop({
    type: String,
    enum: Payment,
    default: Payment.CASH,
  })
  paymentMethod: string;

  // ex. flash, spx
  @Prop()
  delivery?: string;

  @Prop({ required: true })
  orderDate: Date;

  @Prop({ required: true })
  totalPrice?: number;

  @Prop()
  isDeleted?: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// date + sequence
OrderSchema.pre('save', async function (next) {
  const doc = this as any;
  if (doc.isNew) {
    // ex. 20240507
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    const lastOrder = await (doc.constructor as any).findOne(
      { orderNumber: new RegExp(`^OMS${dateStr}`) },
      {},
      { sort: { orderNumber: -1 } },
    );

    // console.log(lastOrder.orderNumber)
    let sequence = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastSeq = parseInt(lastOrder.orderNumber.split('-')[1]);
      sequence = lastSeq + 1;
    }

    doc.orderNumber = `OMS${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
  next;
});
