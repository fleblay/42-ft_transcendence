import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";

import { FriendRequest } from "../model/friend-request.entity";

@Injectable()
@EventSubscriber()
export class NotificationFriendRequest implements EntitySubscriberInterface<FriendRequest> {


	constructor(
		private readonly connection : Connection,
		private usersService: UsersService) {
			connection.subscribers.push(this)
	}

	listenTo() {
		return FriendRequest;
	}

	async afterInsert(event: InsertEvent<FriendRequest>) {
		console.log("after insert event", event.entity);
        const receiver = await this.usersService.findOne(event.entity.receiver.id);
        if (receiver) {


	}
}
}
