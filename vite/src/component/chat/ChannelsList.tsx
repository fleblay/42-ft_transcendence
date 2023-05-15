import React, { useContext, useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { Paper, Table, TableCell, TableContainer, TableHead, TableRow, TableBody, Button, Grid, Link, List, ListItem, ListItemButton, ListItemText, AvatarGroup, Avatar, Badge } from "@mui/material";
import { Link as LinkRouter, useNavigate, useParams } from "react-router-dom";
import { TablePagination } from "@mui/material";
import MailIcon from '@mui/icons-material/Mail';
import { SocketContext } from '../../socket/SocketProvider';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Channel, Member, UserInfo } from "../../types";
import { useAuthService } from "../../auth/AuthService";

const joinChannel = (channelId: number) => {
	apiClient.post(`/api/chat/channels/${channelId}/join`).then((response) => {
		console.log("joinChannel", response);
	}).catch((error) => {
		console.log(error);
	});
}



export function MyChannelsList() {
	const navigate = useNavigate();
	const [myChannelsList, setMyChannelsList] = useState<{ [id: number]: Channel }>({});
	const { customOff, customOn, addSubscription } = useContext(SocketContext);

	// event list :
	// ban
	// kick
	// newChannel
	// newMessage
	// newMember
	//newName

	const { channelId } = useParams()

	useEffect(() => {
		function onModifyChannel(data: Channel) {
			console.log("onModifyChannel", data)
			if (!data || data.directMessage == true)
				return;
			setMyChannelsList(channelList => ({ ...channelList, [data.id]: data }));
		}
		function onDeleteChannel(id : number) {
			if(!id)
				return
			setMyChannelsList(channelList => { delete channelList[id]; console.log(channelList); return {...channelList}; });
			if (channelId && +channelId == id)
				navigate(`/chat`);
		}
		function onUnreadMessage(data: { unreadMessages: number, id: number }) {
			console.log("onUnreadMessage.channel", data);
			if (!channelId || +channelId != data.id)
				setMyChannelsList(channelList => ({ ...channelList, [data.id]: { ...channelList[data.id], unreadMessages: data.unreadMessages } }));
		}

		customOn('chat.modify.channel', onModifyChannel);
		customOn('chat.channel.leave', onDeleteChannel);
		customOn('unreadMessage.channel', onUnreadMessage);
		return () => {
			customOff('chat.modify.channel', onModifyChannel);
			customOff('chat.channel.leave', onDeleteChannel);
			customOff('unreadMessage.channel', onUnreadMessage);
		};
	}, [channelId]);

	useEffect(() => {
		apiClient.get(`/api/chat/channels/my`).then((response) => {
			console.log("MyChannelsList", response);
			setMyChannelsList(response.data.reduce((map: { [id: number]: Channel }, obj: Channel) => {
				map[obj.id] = obj;
				return map;
			}, {}));
		}).catch((error) => {
			console.log(error);
		});
	}, []);


	const mooveToChannel = (channelId: number) => {
		setMyChannelsList(channels => {
			return { ...channels, [channelId]: { ...channels[channelId], unreadMessages: 0 } }
		});
		navigate(`/chat/${channelId}`);
	}

	return (
		<List component="div" disablePadding sx={{
			width: '100%',
			position: 'relative',
			overflow: 'auto',
			maxHeight: 300,
		}}>
			{Object.values(myChannelsList)
				.sort((a: Channel, b: Channel) => b.unreadMessages - a.unreadMessages)
				.map((channel: Channel) => (
					<ListItem key={channel.id} sx={{ pl: 4 }} >
						<ListItemButton onClick={() => mooveToChannel(channel.id)}>
							<Badge badgeContent={channel.unreadMessages} color="primary">
								<ListItemText primary={channel.name} />
							</Badge>
							<AvatarGroup max={3} sx={{ ml: 'auto' }} total={channel.members?.length}>
								{channel?.members?.map((member: Member) => (
									<Avatar key={member.id} src={`/avatars/${member.user.id}.png`} />
								))}
							</AvatarGroup>
						</ListItemButton>
					</ListItem>
				)
				)}
		</List>
	);
}
