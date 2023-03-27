import { Body, Controller, Get, Post, Session } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) { }

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Post('/signup')
	async createUser(@Body() body: any, @Session() session: any) {
		console.log("/signup");
		return body;
	}

}
