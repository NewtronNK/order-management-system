import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    readonly username: string;

    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsString()
    readonly password: string;

    @IsOptional()
    @IsString()
    readonly role?: string = 'user'; 

    @IsOptional()
    @IsBoolean()
    readonly isDeleted?: boolean = false;

    // @IsOptional()
    // @IsString()
    // readonly email?: string;
}

