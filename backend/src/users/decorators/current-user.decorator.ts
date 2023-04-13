import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { User } from "src/model/user.entity";

export const CurrentUser = createParamDecorator(
	(data: never, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest();
		return request.currentUser;
	}
);