import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class UpdateCategoryDto {
    @IsNotEmpty()
    @IsMongoId()
    readonly shopId: string;
    
    @IsNotEmpty()
    @IsString()
    readonly name: string;
}