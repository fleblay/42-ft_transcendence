import { Exclude, Expose } from "class-transformer";

export class UserDto {
	@Expose()
	username: string;
	@Expose()
	email: string;

	@Exclude()
	password: string;
}