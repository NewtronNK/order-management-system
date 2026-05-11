import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsMongoId()
    readonly shopId: string;
    
    @IsNotEmpty()
    @IsString()
    readonly name: string;
}
