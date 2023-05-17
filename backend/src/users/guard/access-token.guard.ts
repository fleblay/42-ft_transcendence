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
        const bearerToken = request.cookies['access_token'];
		if (!bearerToken && request.cookies['refresh_token']) {
			throw new HttpException('Token invalid', 498);
		}
		if (!bearerToken) {
			throw new UnauthorizedException('not connected');
		}
		let decoded;
		try {
			decoded = jwt_decode(bearerToken) as any;
		} catch (e) {
			throw new UnauthorizedException('not connected');
		}
		if (decoded.exp < Date.now() / 1000)
			throw new HttpException('Token expired', 498);
        const user = await this.authService.validateAccessToken(bearerToken);
		if (!user || user === undefined) {
			throw new UnauthorizedException('not connected');
		}
		(request as Request & {currentUser: User}).currentUser  = user;
		return true;
	}
}
//
