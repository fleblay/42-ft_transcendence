import {IsNotEmpty, IsString, Length} from 'class-validator';

export class DfaCodeDto{
	@IsString()
	@IsNotEmpty()
	@Length(6)
	code: string;
}

