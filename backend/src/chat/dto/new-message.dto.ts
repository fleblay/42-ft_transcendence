import { IsOptional, IsString } from "class-validator";

export class NewMessageDto {
	@IsString()
	content: string;

	@IsString()
	@IsOptional()
	gameId?: string;
}