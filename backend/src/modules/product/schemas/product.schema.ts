import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
    @Prop({ type: Types.ObjectId, ref: 'Shop', required: true })
    shopId: Types.ObjectId; // FK → Shop._id (one Shop has many products)

    @Prop({ required: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ required: true })
    price: number; 

    @Prop()
    stock: number;

    @Prop()
    productCode?: string;

    @Prop({ type: Types.ObjectId, ref: 'Category' })
    category?: Types.ObjectId;

    @Prop({ default: 0 })
    soldAmount?: number;

    @Prop()
    isActive?: boolean;

    @Prop()
    isDeleted?: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
