import {IsUUID, IsOptional, IsNumber, Max, Min} from 'class-validator'

export class GameJoinDto {
	@IsUUID()
	@IsOptional()
	gameId: string

	@IsOptional()
	@IsNumber()
	@Max(2)
	@Min(0)
	map: number
}
