import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common'
import {AuthService} from '../../users/auth.service'

@Injectable()
export class EventGuard implements CanActivate {

	constructor(private authService : AuthService){}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const bearerToken = context.switchToWs().getClient().handshake.auth?.token
		if (!bearerToken)
			return false
		console.log(`Bearer token received in EventGuard is ${bearerToken}`)
		const foundUser =  await this.authService.validateToken(bearerToken)
		console.log(`User is ${foundUser}`)
		return !!foundUser
	}
}
