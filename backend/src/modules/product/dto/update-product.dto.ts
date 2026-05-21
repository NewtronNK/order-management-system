import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class UpdateProductDto {
    @IsOptional()
    @IsMongoId()
    readonly shopId: string; 
    
    @IsOptional()
    @IsString()
    readonly name?: string;
    
    @IsOptional()
    @IsNumber()
    readonly price?: string;

    @IsOptional()
    @IsString()
    readonly description?: string;

    @IsOptional()
    @IsNumber()
    readonly stock?: number;

    @IsOptional()
    @IsString()
    readonly productCode?: string;
    
    @IsOptional()
    @IsMongoId()
    readonly category?: string;

    @IsOptional()
    @IsNumber()
    readonly soldAmount? : number;
    
    @IsOptional()
    @IsBoolean()
    readonly isActive?: boolean;
    
    @IsOptional()
    @IsBoolean()
    readonly isDeleted?: boolean;
}
