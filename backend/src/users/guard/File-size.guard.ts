import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import * as multer from "multer";

@Injectable()
export class FileSizeGuard implements CanActivate {

    private readonly maxSize: number = 1024 * 1024 * 5;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const file = request.file as Express.Multer.File;
        console.log(file)
        return file.size <= this.maxSize;
    }
    }
