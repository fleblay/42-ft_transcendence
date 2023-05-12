/* import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";

@Injectable()
@EventSubscriber()
export class notificationRequestSubscriber implements EntitySubscriberInterface<FriendRequest > {


	constructor(
		private readonly connection : Connection,
		private usersService: UsersService) {
			connection.subscribers.push(this)
	}

	listenTo() {
		return ;
	}

	async afterInsert(event: InsertEvent<FriendRequest>) {
	
	}
  
}

import { FriendRequest } from "src/model/friend-request.entity";
import { Message } from "src/model/message.entity";

 */