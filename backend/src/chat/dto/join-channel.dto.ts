import { IsOptional, IsString, IsNumber } from "class-validator";

export class JoinChannelDto {

	@IsOptional()
	@IsString()
	username?: string

	@IsOptional()
	@IsString()
	password?: string
}

