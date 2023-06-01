import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class UsernameDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(20)
	username: string;
}