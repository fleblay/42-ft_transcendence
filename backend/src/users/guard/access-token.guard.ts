import {
	CanActivate,
	ExecutionContext,
    Injectable
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { HttpException } from '@nestjs/common';
import jwt_decode from "jwt-decode";
import {User} from '../../model/user.entity'


@Injectable()
export class ATGuard implements CanActivate {

    constructor(private authService: AuthService) {}

	async canActivate(context: ExecutionContext){
		const request = context.switchToHttp().getRequest() as Request;
		//console.log("ATGuard: before replace", request.headers.authorization);
        const bearerToken = request.headers.authorization?.replace(/Bearer ?/, '');
		//console.log("ATGuard: after replace", request.headers.authorization);
		//console.log ("bearer token", bearerToken)
		if (!bearerToken) {
			console.log("ATGuard: no bearer token");
			return false;
		}
		let decoded = jwt_decode(bearerToken) as any;
		if (decoded.exp < Date.now() / 1000)
			throw new HttpException('Token invalide', 498);
        const user = await this.authService.validateAccessToken(bearerToken);
		//console.log("ATGuard: user", user);
		if (!user || user === undefined) {
			console.log("ATGuard: no user");
			return false;
		}
		(request as Request & {currentUser: User}).currentUser  = user;
		return true;
	}
}
//
