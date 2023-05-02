import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateChannelDto {
	@IsString()
	name: string;

	@IsBoolean()
	private: boolean;

	@IsString()
	@IsOptional()
	password?: string;
}