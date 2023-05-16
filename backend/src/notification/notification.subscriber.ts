import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent } from "typeorm";
import { FriendRequest } from "../model/friend-request.entity";
import { Message } from "../model/message.entity";
import { NotificationService } from "./notification.service";

@Injectable()
@EventSubscriber()
export class NotificationSubscriber implements EntitySubscriberInterface {


	constructor(
		private readonly connection: Connection,
		private notificationService: NotificationService) {
		connection.subscribers.push(this)
	}


	async afterInsert(event: InsertEvent<any>) {
		console.log("after insert", event.entity);
		if (event.entity instanceof FriendRequest) {
			await this.afterInsertFriendRequest(event);
			return;
		}
		else if (event.entity instanceof Message) {
			await this.afterInsertMessages(event);
			return;
		}
	}

	async beforeSoftRemove(event: RemoveEvent<any>) {
		if (event.entity instanceof FriendRequest) {
			await this.beforeRemoveFriendRequest(event);
			return;
		}
	}

	async beforeRemoveFriendRequest(event: RemoveEvent<FriendRequest>) {
		await this.notificationService.deleteNotification(event.entity, "friendRequest");
	}


	async afterInsertFriendRequest(event: InsertEvent<FriendRequest>) {
		const notification = await this.notificationService.generateNotification( "friendRequest", event.entity, event.entity.receiver.id);
		//console.log("notification generated", notification);

	}



	async afterInsertMessages(event: InsertEvent<Message>) {
		console.log("after insert Message", event.entity);
		if (event.entity.channel.directMessage) {
			await this.notificationService.generateNotification("directMessage", event.entity);
			//console.log("notification generated", notification);
		}
	}

	//
}
//