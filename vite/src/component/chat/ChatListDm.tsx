import React, { useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { Paper, Table, TableCell, TableContainer, TableHead, TableRow, TableBody, Button, Grid, Link, List, ListItem, ListItemButton, ListItemText, AvatarGroup, Avatar } from "@mui/material";
import { Link as LinkRouter, useNavigate } from "react-router-dom";
import { TablePagination } from "@mui/material";

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

export function MyDmList() {
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
				<List component="div" disablePadding>
				{MyChannelsList?.map((channel : Channel) => (
					<ListItem key={channel.id} sx={{ pl: 4 }} >
						<ListItemButton  onClick={() => mooveToChannel(channel.id)}>
							<ListItemText primary={channel.name} />
							<AvatarGroup total={channel.members.length}>
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
