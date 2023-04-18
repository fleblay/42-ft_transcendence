import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, map } from 'rxjs'
import { AuthService } from '../../users/auth/auth.service'

@Injectable()
export class WebSocketUserInterceptor implements NestInterceptor {
	constructor(private authService: AuthService) { }

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const request = context.switchToWs()
		/*
		if (!request.getData()[0])
			request.getData()[0] = request.getData()
		else {
			console.log("\x1b[32mWatch out, request.getData() is a array of object !\x1b[0m")
		}
		const data = request.getData()[0]
		*/
		const data = request.getData()
		const bearerToken = data["_access_token"]
		const foundUser = await this.authService.decodeToken(bearerToken)
		request.getData()["_user"] = foundUser
		return next.handle().pipe()
	}
}
