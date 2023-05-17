import { Exclude, Expose } from "class-transformer";

export class RestrictedUserDto {

	@Exclude()
	password: string;

	@Exclude()
	dfaSecret: string;

	@Exclude()
	email: string;

	@Exclude()
	dfa: boolean;
}
