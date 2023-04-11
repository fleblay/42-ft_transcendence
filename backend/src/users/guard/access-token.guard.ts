import {
	CanActivate,
	ExecutionContext,
    Injectable
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';

@Injectable()
export class ATGuard implements CanActivate {

    constructor(private authService: AuthService, private jwtService : JwtService) {}

	async canActivate(context: ExecutionContext){
		const request = context.switchToHttp().getRequest() as Request;
		console.log("ATGuard", request.headers);
        const bearerToken = request.headers.authorization?.replace('Bearer ', '');

		if (!bearerToken) {
			console.log("ATGuard: no bearer token");
			return false;
		}
        const user = await this.authService.validateAccessToken(bearerToken);
		console.log("ATGuard: user", user);
		if (!user || user === undefined) {
			console.log("ATGuard: no user");
			return false;
		}
		return true;
	}
}