import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { Status, Payment } from '../schemas/order.schema';

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

  @IsNotEmpty()
  @IsString()
  readonly productCode: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsNumber()
  readonly quantity: number;

  @IsNotEmpty()
  @IsNumber()
  readonly totalPrice: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly shopId: string;

  @IsOptional()
  @IsString()
  readonly orderNumber: string;

  @IsNotEmpty()
  readonly orderItem: OrderItem[];

  @IsOptional()
  @IsEnum(Status)
  readonly status?: Status;

  @IsOptional()
  readonly shopAddress?: Address;

  @IsOptional()
  readonly customerAddress?: Address;

  @IsOptional()
  @IsEnum(Payment)
  readonly paymentMethod: Payment;

  @IsOptional()
  @IsString()
  readonly delivery?: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  readonly orderDate: Date;

  @IsNotEmpty()
  @IsNumber()
  readonly totalPrice: number;

  @IsOptional()
  @IsBoolean()
  readonly isDeleted?: boolean = false;
}
