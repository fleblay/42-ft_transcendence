import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common'
import {AuthService} from '../../users/auth/auth.service'

@Injectable()
export class EventGuard implements CanActivate {

	constructor(private authService : AuthService){}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToWs()
		const data = request.getData()
		const bearerToken = data["_access_token"]
		return !!(await this.authService.decodeToken(bearerToken))
	}
}
