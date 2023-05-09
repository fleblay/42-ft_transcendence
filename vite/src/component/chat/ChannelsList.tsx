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
	const auth = useAuthService();
	const [myChannelsList, setMyChannelsList] = useState<{ [id: number]: Channel }>({});
	const { customOff, customOn, addSubscription } = useContext(SocketContext);

	useEffect(() => {
		return addSubscription(`/chat/myChannels/${auth.user?.id}`);
	}, [auth.user?.id]);

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
			console.log("onModifyChannel", data);
			//if (myChannelsList[data.id].unreadMessages !== data.unreadMessages && (channelId ?? 0) === data.id) return;
			setMyChannelsList(myChannelsList => ({ ...myChannelsList, [data.id] : data})	);
		}
		function onDeleteChannel(data: Channel) {
			setMyChannelsList(myChannelsList => { delete myChannelsList[data.id]; return myChannelsList; });
		}
	
		customOn('modifyChannel', onModifyChannel);
		customOn('leaveChannel', onDeleteChannel);
		return () => {
			customOff('modifyChannel', onModifyChannel);
			customOff('leaveChannel', onDeleteChannel);

		};
	}, []);

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
						<AvatarGroup sx={{ ml: 'auto' }} total={channel.members?.length}>
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





export function ChannelsListDebug({ channels }: { channels: Channel[] }) {

	const rows = channels.map((channel: Channel) => {
		return {
			channelId: channel.id,
			channelName: channel.name,
			private: channel.private,
		}
	});


	return (
		<div>

			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
					<TableHead>
						<TableRow>
							<TableCell align="left">channelId</TableCell>
							<TableCell align="right">ChannelName</TableCell>
							<TableCell align="right">Private</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows?.map((row) => (
							<TableRow
								key={row.channelId}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>

								<TableCell align="right">{row.channelName}</TableCell>
								<TableCell align="right">{row.private}</TableCell>
								<TableCell align="right"><Button onClick={() => joinChannel(row.channelId)}> Join</Button></TableCell>
							</TableRow>
						)
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</div>
	);
}
