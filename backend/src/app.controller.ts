import { Body, Controller, Get, Post, Session, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ATGuard } from './users/guard/access-token.guard';


@Controller()
export class AppController {
	constructor(private readonly appService: AppService) { }
	@Get("areyouready")
	getAlive(): string {
		return "Yes I'm ready";
	}

	@Get("protected")
	@UseGuards(ATGuard)
	getProtected(): string {
		return "You are protected";
	}
	


}
