import {
	CanActivate,
	ExecutionContext,
    Injectable,
	UnauthorizedException
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
        const bearerToken = request.cookies['access_token'];
		if (!bearerToken && request.cookies['refresh_token']) {
			throw new HttpException('Token invalid', 498);
		}
		//console.log("ATGuard: after replace", request.headers.authorization);
		// console.log ("access token", bearerToken)
		if (!bearerToken) {
			console.log("ATGuard: no bearer token");
			throw new UnauthorizedException('not connected');
		}
		let decoded = jwt_decode(bearerToken) as any;
		if (decoded.exp < Date.now() / 1000)
			throw new HttpException('Token expired', 498);
        const user = await this.authService.validateAccessToken(bearerToken);
		//console.log("ATGuard: user", user);
		if (!user || user === undefined) {
			console.log("ATGuard: no user");
			throw new UnauthorizedException('not connected');
		}
		(request as Request & {currentUser: User}).currentUser  = user;
		return true;
	}
}
//
