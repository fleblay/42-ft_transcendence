import {IsString} from 'class-validator';

export class DfaCodeDto{
	@IsString()
	code: string;
}

