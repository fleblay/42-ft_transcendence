import {IsUUID, IsOptional, IsNumber, Max, Min} from 'class-validator'

export class GameCreateDto {
	@IsOptional()
	@IsNumber()
	@Max(2)
	@Min(0)
	map: number
}
