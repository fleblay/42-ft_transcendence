import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

	constructor(private usersService: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // methode for decoding the token type Bearer ( in the header of the request)
			ignoreExpiration: false,
			secretOrKey: 'secret', // not secure at all need to be changed in production  put in a .env file
		});
	}

	async validate(payload: any) {
		const user = await this.usersService.findOne(payload.sub);
		if (!user) {
			throw new UnauthorizedException();
		}
		return { userId: user.id, username: user.username };
	}

}