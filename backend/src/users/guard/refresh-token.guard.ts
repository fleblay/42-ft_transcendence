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
		//console.log("RTGuard");
		const request = context.switchToHttp().getRequest();
		// besoin de vérifier que le refresh token est valide
		const refreshToken = request.cookies['refresh_token'];
		console.log("refresh token:", refreshToken)
		
		if (!refreshToken) {
			return false;
		}
		const user = await this.authService.validateRefreshToken(refreshToken);
		//console.log("user:" , user);
		if (!user) {
			return false;
		}
		//console.log("RTGuard return true");
		return true;

	}
}
