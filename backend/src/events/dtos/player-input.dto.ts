import {IsUUID, IsString, IsOptional, IsNumber, Max, Min} from 'class-validator'

export class PlayerInputDto {
	@IsUUID()
	gameId: string

	@IsString()
	@IsOptional()
	move: string

	@IsOptional()
	@IsString()
	powerup: string
}

