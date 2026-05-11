import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty()
    @IsMongoId()
    readonly shopId: string; 
    
    @IsNotEmpty()
    @IsString()
    readonly name: string;
    
    @IsOptional()
    @IsString()
    readonly description?: string;
    
    @IsNotEmpty()
    @IsNumber()
    readonly price: string;

    @IsOptional()
    @IsNumber()
    readonly stock: number = 0;

    @IsOptional()
    @IsString()
    readonly productCode?: string;
    
    @IsOptional()
    @IsMongoId()
    readonly category?: string;

    @IsOptional()
    @IsNumber()
    readonly soldAmount? : number = 0;
    
    @IsOptional()
    @IsBoolean()
    readonly isActive?: boolean = true;
    
    @IsOptional()
    @IsBoolean()
    readonly isDeleted?: boolean = false;
}
