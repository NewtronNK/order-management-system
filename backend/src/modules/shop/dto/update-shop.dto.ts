import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

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
    readonly postcode?: string;

    @IsOptional()
    @IsString()
    readonly contact?: string;

    @IsOptional()
    @IsBoolean()
    readonly isDefault?: boolean;
}

export class UpdateShopDto {
    @IsNotEmpty()
    @IsMongoId()
    readonly ownerId: string;

    @IsOptional()
    @IsString()
    readonly name: string;

    @IsOptional()
    @IsString()
    readonly description?: string;

    @IsOptional()
    @IsString()
    readonly email: string;

    @IsOptional()
    @IsString()
    readonly contact?: string;

    @IsOptional()
    readonly addresses?: Address[];

    @IsOptional()
    @IsString()
    readonly businessType?: string;

    @IsOptional()
    @IsBoolean()
    readonly isDeleted?: boolean;
}
