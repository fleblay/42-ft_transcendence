import {IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength} from 'class-validator';

export class CreateUserDto{
	@IsEmail()
	email: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(20)
	username: string;

	@IsString()
	password: string;
}