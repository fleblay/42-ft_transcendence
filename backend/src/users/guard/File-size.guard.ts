import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import * as multer from "multer";

@Injectable()
export class FileSizeGuard implements CanActivate {

	private readonly maxSize: number = 1000000;

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest() as Request;

		const fileSize = request.headers["content-length"] || Infinity;
		console.log("fileSize", fileSize);
		return +fileSize <= this.maxSize;
	}
}
