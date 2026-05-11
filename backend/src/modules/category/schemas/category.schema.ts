import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema()
export class Category {
    @Prop({ type: Types.ObjectId, ref: 'Shop', required: true })
    shopId: Types.ObjectId; // FK → Shop._id (categories are isolated per shop)

    @Prop({ required: true })
    name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);