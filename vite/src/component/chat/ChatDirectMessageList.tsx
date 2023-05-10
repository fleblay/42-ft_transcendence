import React, { useContext, useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { List, ListItem, ListItemButton, ListItemText, Avatar, Badge } from "@mui/material";
import { Link as LinkRouter, useNavigate, useParams } from "react-router-dom";
import { SocketContext } from '../../socket/SocketProvider';

import { Channel } from "../../types";
import { useAuthService } from "../../auth/AuthService";
import { StyledBadge } from "./ChatFriendsBrowser";


export function MyDirectMessageList() {
	const navigate = useNavigate();
	const auth = useAuthService();
	const [myDmList, setMyDmList] = useState<{ [id: number]: Channel }>({});
	const { customOff, customOn, addSubscription } = useContext(SocketContext);

	useEffect(() => {
		return addSubscription(`/chat/myChannels/${auth.user?.id}`);
	}, [auth.user?.id]);


	useEffect(() => {
		apiClient.get(`/api/chat/channels/dm`).then((response) => {
			console.log("MyDmList", response);
			console.log("MyDmList data", response.data);
			if (response.data.length == 0)
				return;
			setMyDmList(response.data.reduce((map: { [id: number]: Channel }, obj: Channel) => {
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
			console.log("onModifyChannel", data)
			if (!data)
				return;
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
						<ListItem key={channel.id} sx={{ pl: 4 }} >
							<ListItemButton onClick={() => mooveToChannel(channel.id)}>
								<StyledBadge
									overlap="circular"
									anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
									variant="dot"
									color={friend.isConnected ? "success" : "error"}
								>
									<Avatar src={`/avatars/${friend.id}.png`} sx={{ margin: 1, width: '40px', height: '40px' }} />
								</StyledBadge>
								<Badge badgeContent={channel.unreadMessages} color="primary">
									<ListItemText primary={friend.user.username} />
								</Badge>
							</ListItemButton>

						</ListItem>
					)
				})

			}
		</List>
	);
}
