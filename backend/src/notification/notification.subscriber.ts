import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from "typeorm";
import { FriendRequest } from "../model/friend-request.entity";
import { Message } from "../model/message.entity";
import { NotificationService } from "./notification.service";
import { Member } from "../model/member.entity";

@Injectable()
@EventSubscriber()
export class NotificationSubscriber implements EntitySubscriberInterface {


	constructor(
		private readonly connection: Connection,
		private notificationService: NotificationService) {
		connection.subscribers.push(this)
	}


	async afterInsert(event: InsertEvent<any>) {
		if (event.entity instanceof FriendRequest) {
			await this.afterInsertFriendRequest(event);
			return;
		}
		else if (event.entity instanceof Message) {
			await this.afterInsertMessages(event);
			return;
		}
		else if (event.entity instanceof Member) {
			await this.afterInsertMember(event);
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
	}

	async afterInsertMember(event: InsertEvent<Member>) {
		if (event.entity.role !== "owner" && event.entity.channel.private && event.entity.channel.directMessage === false) {
			await this.notificationService.generateNotification("channelInvitation", event.entity, event.entity.user.id);
		}
	}






	async afterInsertMessages(event: InsertEvent<Message>) {
		if (event.entity.channel.directMessage) {
			await this.notificationService.generateNotification("directMessage", event.entity);
		}
	}

	//
}
//