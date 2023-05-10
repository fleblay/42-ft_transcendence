import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm';
import { Channel } from '../model/channel.entity';
import { UsersService } from '../users/users.service';
import { Server } from 'socket.io'
import { Member } from '../model/member.entity';

@EventSubscriber()
export class ChannelSubscriber implements EntitySubscriberInterface<Channel> {

    private wsServer: Server;

    constructor(private usersService: UsersService) {
        console.log('ChannelSubscriber created');
    }

    setWsServer(server: Server) {
        this.wsServer = server;
    }

    listenTo() {
        return Channel; // Spécifiez l'entité à écouter les événements
    }

    afterInsert(event: InsertEvent<Channel>) {
        console.log('Channel inserted:', event.entity.name);
    }

    afterUpdate(event: UpdateEvent<Channel>) {
        if (!event.entity)
            return;
        const toSend = {
            ...event.entity,
            password: undefined,
            hasPassword: event.entity.password.length !== 0,
            members: event.entity.members.filter((member: Member) => !member.left)
                .map((member: Member) => (
                    {
                        ...member,
                        isConnected: this.usersService.isConnected(member.user.id)
                    }
                ))
        };
        for (const member of event.entity.channel.members) {
            if (!member.left)
                this.wsServer.to(`/chat/myChannels/${member.user.id}`).emit('chat.modify.channel', toSend);
        }
    }
}
////