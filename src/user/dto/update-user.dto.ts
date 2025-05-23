import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsEmail, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    name?: string;
    @IsEmail()
    email?: string;
    @IsString()
    @MinLength(4)
    password?: string;
}
