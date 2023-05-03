import { IsBoolean, IsOptional, IsString } from "class-validator";

export class ChangeChannelDto {
	@IsString()
    @IsOptional()
	name?: string;
    
	@IsString()
	@IsOptional()
	password?: string;
}