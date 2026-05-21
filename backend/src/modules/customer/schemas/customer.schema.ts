import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ type: Types.ObjectId, ref: 'Shop', required: true })
  shopId: Types.ObjectId; // FK → Shop._id (one Shop can own many orders)

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  contact: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Order' }], default: [] })
  orderIds: Types.ObjectId[];

  @Prop({ type: Date })
  firstPurchase: Date;

  @Prop({ type: Date })
  latestPurchase: Date;

  @Prop({ default: 0 })
  orderCount: number;

  @Prop({ default: 0 })
  totalValue: number;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Ensure 1 customer is uniquely indicated by name & contact per shop
CustomerSchema.index({ shopId: 1, name: 1, contact: 1 }, { unique: true });
