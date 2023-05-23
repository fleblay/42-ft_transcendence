import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, map } from 'rxjs'
import { AuthService } from '../../users/auth/auth.service'

@Injectable()
export class WebSocketUserInterceptor implements NestInterceptor {
	constructor(private authService: AuthService) { }

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const request = context.switchToWs()
		const data = request.getData()
		const bearerToken = data["_access_token"]
		const foundUser = await this.authService.decodeToken(bearerToken)
		request.getData()["_user"] = foundUser
		return next.handle().pipe()
	}
}
