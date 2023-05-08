import React, { useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { Paper, Table, TableCell, TableContainer, TableHead, TableRow, TableBody, Button, Grid, Link, List, ListItem, ListItemButton, ListItemText, AvatarGroup, Avatar, ListSubheader } from "@mui/material";
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

export function MyDirectMessageList() {
	const navigate = useNavigate();
	const auth = useAuthService();
	const [MyDmList, setMyDmList] = useState<Channel[]>();


	useEffect(() => {
		apiClient.get(`/api/chat/channels/dm`).then((response) => {
			console.log("MyDmList", response);
			setMyDmList(response.data);
		}).catch((error) => {
			console.log(error);
		});
	}, []);


	const mooveToChannel = (channelId: number) => {
		navigate(`/chat/${channelId}`);
	}


	return (
		<List component="div" disablePadding sx={{
			width: '100%',
			position: 'relative',
			overflow: 'auto',
			maxHeight: 300,

		}} subheader={<li />}>
			<ListSubheader>{`I'm sticky`}</ListSubheader>


			{MyDmList?.map((channel: Channel) => {
				const AvatarPath = `/avatars/${auth.user?.id == channel.members[0].user.id ? channel.members[0].user.id : channel.members[1].user.id}.png`;
				return (
					<ListItem key={channel.id} sx={{ pl: 4 }} >
						<ListItemButton onClick={() => mooveToChannel(channel.id)}>
							<Avatar src={`/avatars/${AvatarPath}.png`} />
						</ListItemButton>
					</ListItem>
				)
			})

			}
		</List>
	);
}
