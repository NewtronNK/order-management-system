import { IsString } from "class-validator";

export class ChangeNameDto {
    // @IsString()
    // password: string;

    @IsString()
    name: string;
}
