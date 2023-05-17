import { Avatar, Badge, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { FC, useContext, useEffect, useState } from "react";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../auth/interceptor.axios";
import { SocketContext } from '../../socket/SocketProvider';

import { useAuthService } from "../../auth/AuthService";
import { Channel, Member } from "../../types";
import { StyledBadge } from "./ChatFriendsBrowser";


interface FriendDisplayProps {
	originalMember: Member;
	channel: Channel;
	mooveToChannel: (channelId: number) => void;
}

export const joinDm = (userId: number, navigate: NavigateFunction) => {
	apiClient.post(`/api/chat/dm/${userId}/join`).then((response) => {
		console.log("joinChannel", response);
		navigate(`/chat/${response.data}`);
	}).catch((error) => {
		console.log(error);
	});
}


const FriendDisplay: FC<FriendDisplayProps> = ({ originalMember, channel, mooveToChannel }) => {
	const navigate = useNavigate();
	const [member, setMember] = useState<Member>(originalMember);
	const { addSubscription, customOn, customOff } = useContext(SocketContext);

	useEffect(() => {
		return addSubscription(`/player/${member.user.id}`);
	}, []);

	useEffect(() => {
		function onFriendUpdate({ userId, event }: { userId: number, event: string }) {
			console.log("onFriendUpdate", userId, event);
			switch (event) {
				case "connected":
					setMember((oldMember) => {
						return { ...oldMember, isConnected: true };
					});
					break;
				case "disconnected":
					setMember((oldMember) => {
						return { ...oldMember, isConnected: false };
					});
					break;
				default:
					break;

			}
		}
		customOn("page.player", onFriendUpdate);
		return () => {
			customOff("page.player", onFriendUpdate);
		}
	}, [member])

	return (
		<ListItem key={channel.id} sx={{ pl: 4 }} >
			<ListItemButton onClick={() => mooveToChannel(channel.id)}>
				<StyledBadge
					overlap="circular"
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					variant="dot"
					color={member.isConnected ? "success" : "error"}
				>
					<Avatar src={`/avatars/${member.user.id}.png`} sx={{ margin: 1, width: '40px', height: '40px' }} />
				</StyledBadge>
				<Badge badgeContent={channel.unreadMessages} color="primary">
					<ListItemText primary={member.user.username} />
				</Badge>
			</ListItemButton>

		</ListItem>
	)
}



export function MyDirectMessageList() {
	const navigate = useNavigate();
	const auth = useAuthService();
	const [myDmList, setMyDmList] = useState<{ [id: number]: Channel }>({});
	const { customOff, customOn } = useContext(SocketContext);

	useEffect(() => {
		apiClient.get(`/api/chat/channels/dm`).then((response) => {
			console.log("MyDmList", response);
			console.log("MyDmList data", response.data);
			if (response.data.length == 0)
				return;
			setMyDmList(response.data.reduce((map: { [id: number]: Channel }, obj: Channel) => {
				if (obj.members.length != 2)
					return map;
				map[obj.id] = obj;
				return map;
			}, {}));
		}).catch((error) => {
			console.log(error);
		});
	}, []);

	const { channelId } = useParams()

	useEffect(() => {
		function onModifyChannel(data: Channel) {
			console.log("onModifyChannel dm", data)

			if (!data)
				return;
			if (data.members.length != 2)
				return;
			if (data.directMessage == true)
				setMyDmList(channelList => ({ ...channelList, [data.id]: data }));
		}
		function onDeleteChannel(id: number) {
			if (!id)
				return
			setMyDmList(channelList => { delete channelList[id]; console.log(channelList); return { ...channelList }; });
			if (channelId && +channelId == id)
				navigate(`/chat`);
		}
		function onUnreadMessage(data: { unreadMessages: number, id: number }) {
			console.log("onUnreadMessage.dm", data);
			if (!channelId || +channelId != data.id)
				setMyDmList(channelList => ({ ...channelList, [data.id]: { ...channelList[data.id], unreadMessages: data.unreadMessages } }));
		}

		customOn('chat.modify.channel', onModifyChannel);
		customOn('chat.channel.leave', onDeleteChannel);
		customOn('unreadMessage.dm', onUnreadMessage);
		return () => {
			customOff('chat.modify.channel', onModifyChannel);
			customOff('chat.channel.leave', onDeleteChannel);
			customOff('unreadMessage.dm', onUnreadMessage);
		};
	}, [channelId]);


	const mooveToChannel = (channelId: number) => {
		setMyDmList(channelList => ({ ...channelList, [channelId]: { ...channelList[channelId], unreadMessages: 0 } }));
		navigate(`/chat/${channelId}`);
	}


	return (
		<List component="div" disablePadding sx={{
			width: '100%',
			position: 'relative',
			overflow: 'auto',
			maxHeight: 300,

		}}>
			{Object.values(myDmList)
				.sort((a: Channel, b: Channel) => b.unreadMessages - a.unreadMessages)
				.map((channel: Channel) => {
					const friend = channel.members[0].user.id == auth.user?.id ? channel.members[1] : channel.members[0];
					return (
						<FriendDisplay key={channel.id} originalMember={friend} channel={channel} mooveToChannel={mooveToChannel} />
					)
				})

			}
		</List>
	);
}
