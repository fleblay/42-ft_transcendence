import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common'
import {Observable, map} from 'rxjs'
import {AuthService} from '../../users/auth/auth.service'

@Injectable()
export class WebSocketUserInterceptor implements NestInterceptor {
	constructor(private authService : AuthService){}

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const request = context.switchToWs()
		//bearerToken doit exister car l'interceptor est fait apres le guard
		const bearerToken = context.switchToWs().getClient().handshake.auth?.token
		const foundUser =  await this.authService.validateToken(bearerToken)
		//console.log("Added User ", foundUser, "to Websocket incomming message data")
		request.getData()["_user"] = foundUser
		return next.handle().pipe()
	}
}
