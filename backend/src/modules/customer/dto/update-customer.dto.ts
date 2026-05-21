import { IsArray, IsDate, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class UpdateCustomerDto {
  @IsOptional()
  @IsArray()
  orderIds?: Types.ObjectId[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  firstPurchase?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  latestPurchase?: Date;

  @IsOptional()
  @IsNumber()
  orderCount?: number;

  @IsOptional()
  @IsNumber()
  totalValue?: number;
}
