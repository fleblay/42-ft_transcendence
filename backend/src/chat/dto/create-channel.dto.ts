import { IsBoolean, IsOptional, IsString, Length } from "class-validator";

export class CreateChannelDto {
	@IsString()
	@Length(1, 15)
	name: string;

	@IsBoolean()
	private: boolean;

	@IsString()
	@IsOptional()
	password?: string;

	@IsBoolean()
	@IsOptional()
	directMessage?: boolean;

}