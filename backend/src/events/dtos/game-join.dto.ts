import {IsUUID, IsOptional, IsNumber, Max, Min} from 'class-validator'

export class GameJoinDto {
	@IsUUID()
	gameId: string
}
