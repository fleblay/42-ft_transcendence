import {
	CanActivate,
	ExecutionContext,
  Injectable
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';


@Injectable()
export class RTGuard implements CanActivate {

    constructor(private authService: AuthService, private jwtService : JwtService) {}

	canActivate(context: ExecutionContext){
		const request = context.switchToHttp().getRequest();
    const refreshToken = request.get('X-Refresh-Token');
    const user = this.authService.validateRefreshToken(refreshToken);
		if (!user) {
			return false;
		}
		return true;
	}
	
}