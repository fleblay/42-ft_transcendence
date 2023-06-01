import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { TypeOrmFilter } from './typeorm.filter';
import { UnauthorizedExceptionFilter } from './unauthorizedException.filter';

// doc express-session: https://www.npmjs.com/package/express-session
if (process.env.NODE_ENV === 'production') {
	console.log = function () {};
}
async function bootstrap() {
	const app = await NestFactory.create(AppModule);


	app.use(cookieParser())
	app.useGlobalFilters(new TypeOrmFilter);
	app.useGlobalFilters(new UnauthorizedExceptionFilter);
	await app.listen(3000);
}
bootstrap();
