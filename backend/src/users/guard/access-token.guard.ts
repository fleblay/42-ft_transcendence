import {
	CanActivate,
	ExecutionContext,
    Injectable
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ATGuard implements CanActivate {

    constructor(private authService: AuthService, private jwtService : JwtService) {}

	canActivate(context: ExecutionContext){
		const request = context.switchToHttp().getRequest();
        const bearerToken = request.headers.authorization.split(' ')[1];
        const user = this.authService.validateAccessToken(bearerToken);
		if (!user) {
			return false;
		}
		return true;
	}
	
}