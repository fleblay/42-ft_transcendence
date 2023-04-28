import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import jwt_decode from "jwt-decode";


@Injectable()
export class DfaGuard implements CanActivate {

	constructor(private authService: AuthService) { }

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest() as Request;
		const dfaToken = request.cookies['dfa_token'];
		if (!dfaToken) {
			return false;
		}
		let decoded = jwt_decode(dfaToken) as any;
		if (decoded.exp < Date.now() / 1000)
			throw new UnauthorizedException('DFA Token expired');
		return true;
	}
}
