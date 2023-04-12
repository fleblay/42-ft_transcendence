import { Body, Controller, Get, Post, Session } from '@nestjs/common';
import { AppService } from './app.service';


@Controller()
export class AppController {
	constructor(private readonly appService: AppService) { }
	@Get("areyoualive")
	getAlive(): string {
		return "Yes I'm alive";
	} 

}
