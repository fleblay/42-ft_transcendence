import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common'
import {Observable, map} from 'rxjs'
import {AuthService} from '../../users/auth/auth.service'

@Injectable()
export class WebSocketUserInterceptor implements NestInterceptor {
	constructor(private authService : AuthService){}

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const request = context.switchToWs()
		console.log("This is full data start", request.getData())
		const bearerToken = request.getData()[0]["_access_token"]
		console.log("This is bearer token", bearerToken)
		const foundUser =  await this.authService.validateToken(bearerToken)
		request.getData()["_user"] = foundUser
		console.log("This is full data next", request.getData())
		console.log("This is full data [0]", request.getData()[0])
		return next.handle().pipe()
	}
}
