import {
	CanActivate,
	ExecutionContext,
	Injectable
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';


@Injectable()
export class RTGuard implements CanActivate {

	constructor(private authService: AuthService, private jwtService: JwtService) { }

	async canActivate(context: ExecutionContext) {
		console.log("RTGuard");
		const request = context.switchToHttp().getRequest();
		const refreshToken = request.get('X-Refresh-Token');
		console.log("refresh token:" , refreshToken)
		if (!refreshToken) {
			return false;
		}
		try {
			const user =  await this.authService.validateRefreshToken(refreshToken);
			console.log("user:" , user);
			if (!user) {
				return false;
			}
			return true;
		} catch (e) {
			console.error('RTGuard trycatch:', e)
			return 	false;
		}
		
   
	}
}