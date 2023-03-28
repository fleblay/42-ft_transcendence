import { AuthGuard } from "@nestjs/passport";
import { ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class LocalAuthGuard extends AuthGuard('local')
{
	async canActivate(context: ExecutionContext) {
		const result = (await super.canActivate(context)) as boolean; // get the result of the super class canActivate method
		const request = context.switchToHttp().getRequest(); // get the request object
		await super.logIn(request); // am i logged in? 
		console.log("LocalAuthGuard: " + request.user);
		return result;
	}
}