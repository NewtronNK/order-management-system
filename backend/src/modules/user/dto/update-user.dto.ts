import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsEmail } from 'class-validator';

export class UpdateUserDto {
    @IsNotEmpty()
    @IsString()
    readonly username?: string;

    @IsNotEmpty()
    @IsString()
    readonly name?: string;

    @IsOptional()
    @IsString()
    readonly password?: string;

    @IsOptional()
    @IsString()
    readonly role?: string; 

    @IsOptional()
    @IsBoolean()
    readonly isDeleted?: boolean;

    // @IsOptional()
    // @IsString()
    // readonly email?: string;
}

