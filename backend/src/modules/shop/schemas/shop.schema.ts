import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShopDocument = Shop & Document;

@Schema()
class Address {
    @Prop()
    shopName?: string;

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

    @Prop({ default: false })
    isDefault?: boolean;
}
const AddressSchema = SchemaFactory.createForClass(Address);

@Schema()
export class Shop {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    ownerId: Types.ObjectId; // FK → User._id (one User can own many shops)

    @Prop({ required: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ required: true })
    email: string;

    @Prop()
    contact?: string

    @Prop({ type: [AddressSchema] })
    addresses?: Address[];

    @Prop()
    businessType?: string;

    @Prop()
    isDeleted?: boolean;
}

export const ShopSchema = SchemaFactory.createForClass(Shop);