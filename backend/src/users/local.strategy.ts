import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy)
{
	constructor(private authService: AuthService){
		super(); // config strategy
	}

	async validate(id: number, email: string, password: string): Promise<any> {
		const user = await this.authService.validateUser(id, email, password);
		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}