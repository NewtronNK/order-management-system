import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

class Address {
    @IsOptional()
    @IsString()
    readonly name?: string;

    @IsOptional()
    @IsString()
    readonly detail?: string;

    @IsOptional()
    @IsString()
    readonly province?: string;

    @IsOptional()
    @IsString()
    readonly district?: string;

    @IsOptional()
    @IsString()
    readonly subdistrict?: string;

    @IsOptional()
    @IsString()
    readonly contact?: string;

    @IsOptional()
    @IsString()
    readonly postcode?: string;
}

class OrderItem {
    @IsNotEmpty()
    @IsMongoId()
    readonly productId: string;

    @IsOptional()
    @IsNumber()
    readonly quantity: number;

    @IsOptional()
    @IsNumber()
    readonly totalPrice: number; 
}

export class UpdateOrderDto {
    @IsNotEmpty()
    @IsMongoId()
    readonly shopId: string;

    @IsOptional()
    @IsString()
    readonly orderNumber?: string;

    @IsOptional()
    readonly orderItem?: OrderItem[];

    @IsOptional()
    @IsString()
    readonly status?: string;

    @IsOptional()
    readonly shopAddress?: Address;

    @IsOptional()
    readonly customerAddress?: Address;

    @IsOptional()
    @IsString()
    readonly paymentMethod: string;

    @IsOptional()
    @IsString()
    readonly delivery?: string;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    readonly orderDate: Date;
    
    @IsOptional()
    @IsBoolean()
    readonly isDeleted?: boolean;    
}
