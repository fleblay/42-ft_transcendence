import React, { useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { Paper, Table, TableCell, TableContainer, TableHead, TableRow, TableBody, Button, Grid, Link, List, ListItem, ListItemButton, ListItemText, AvatarGroup, Avatar, Badge } from "@mui/material";
import { Link as LinkRouter, useNavigate } from "react-router-dom";
import { TablePagination } from "@mui/material";
import MailIcon from '@mui/icons-material/Mail';

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
	const [MyChannelsList, setMyChannelsList] = useState<Channel[]>();


	useEffect(() => {
		apiClient.get(`/api/chat/channels/my`).then((response) => {
			console.log("MyChannelsList", response);
			setMyChannelsList(response.data);
		}).catch((error) => {
			console.log(error);
		});
	}, []);


	const mooveToChannel = (channelId: number) => {
		navigate(`/chat/${channelId}`);
	}


	return (
		<nav aria-label="secondary mailbox folders">
			<List component="div" disablePadding>
				{MyChannelsList?.map((channel: Channel) => (
					<ListItem key={channel.id} sx={{ pl: 4 }} >
						<ListItemButton onClick={() => mooveToChannel(channel.id)}>
							<Badge badgeContent={0} color="primary">
							<ListItemText primary={channel.name} />
							</Badge>
							<AvatarGroup sx={{ml :'auto'}} total={channel.members.length}>
								{channel?.members?.map((member: Member) => (
									<Avatar key={member.id} src={`/avatars/${member.user.id}.png`} />
								))}
							</AvatarGroup>

						</ListItemButton>
					</ListItem>
				)
				)}
			</List>
		</nav>
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
