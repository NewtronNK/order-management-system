import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    name: string;

    @Prop()
    password: string;

    @Prop({ default: 'user' })
    role: string;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop()
    googleId: string;

    @Prop()
    email: string; // required for Google OAuth
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});