import React, { useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { Paper, Table, TableCell, TableContainer, TableHead, TableRow, TableBody, Button, Grid, Link, List, ListItem, ListItemButton, ListItemText, AvatarGroup, Avatar, ListSubheader } from "@mui/material";
import { Link as LinkRouter, useNavigate } from "react-router-dom";
import { TablePagination } from "@mui/material";

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Channel, Member, UserInfo } from "../../types";
import { useAuthService } from "../../auth/AuthService";
import { StyledBadge } from "./ChatFriendsBrowser";


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

		}}>


			{MyDmList?.map((channel: Channel) => {
				const friend = channel.members[0].user.id == auth.user?.id ? channel.members[1] : channel.members[0];
				const AvatarPath = `/avatars/${friend.user.id}.png`;
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
							<ListItemText primary={friend.user.username} />						</ListItemButton>
					</ListItem>
				)
			})

			}
		</List>
	);
}
