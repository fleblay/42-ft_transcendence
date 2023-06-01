import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError, TypeORMError } from 'typeorm';


@Catch(QueryFailedError, EntityNotFoundError)
export class TypeOrmFilter implements ExceptionFilter {
	catch(exception: TypeORMError, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse();
		const customResponse = {
			status: 400,
			message: 'Something Went Wrong',
			timestamp: new Date().toISOString(),
		};
		console.log("\x1b[31m%s\x1b[0m", "TypeOrmFilter", "\x1b[0m\n", exception)
		response.status(customResponse.status).json(customResponse);
	}
}