import { AuthGuard } from "@nestjs/passport";
import { ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class LocalAuthGuard extends AuthGuard('local')
{}