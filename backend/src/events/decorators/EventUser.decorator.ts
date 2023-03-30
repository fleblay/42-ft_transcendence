import {createParamDecorator, ExecutionContext} from '@nestjs/common'
import {User} from '../../model/user.entity'

export const EventUserDecorator = createParamDecorator( (data: unknown, context: ExecutionContext):User =>{
	const request = context.switchToWs()
	//console.log('Decorator adding user', request.getData()._user)
	return request.getData()._user
})
