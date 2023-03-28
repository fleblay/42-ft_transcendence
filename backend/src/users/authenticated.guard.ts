import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// This guard is used to protect routes that require authentication
// CanActivate is an interface that has a single method: canActivate
// The canActivate method returns a boolean value
// If the method returns true, the route is accessible
// If the method returns false, the route is not accessible
@Injectable()
export class AuthenticatedGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean {
	const request = context.switchToHttp().getRequest(); // get the request object from the context object	
	return request.isAuthenticated(); // check if the user is authenticated
  }
}