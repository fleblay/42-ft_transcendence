import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    console.log("UnauthorizedExceptionFilter");
    response.clearCookie('refresh_token');
    response.clearCookie('access_token');
    response.status(401).json({ message: 'Unauthorized' });
  }
}