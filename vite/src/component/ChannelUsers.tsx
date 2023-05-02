import React, { useEffect, useState } from "react";
import apiClient from "../auth/interceptor.axios";
import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import { Link as LinkRouter, useNavigate } from "react-router-dom";

import { Channel } from "../types";

type Member = {
	id: string;
	username: string;
	isConnected: boolean;
	role: string;
};



export function ChannelUsers({ channelId }: { channelId: string }) {
	const [rows, setRows] = useState<Member[]>([]);
	const [admin, setAdmin] = useState<Member[] | null>(null);
	const [member, setMember] = useState<Member[] | null>(null);




	useEffect(() => {
		apiClient.get(`/api/chat/channels/${channelId}/members`).then((response) => {
			setRows(response.data);
		}).catch((error) => {
			console.log(error);
		});
	}, [channelId]);

	useEffect(() => {
		setAdmin(rows.filter((row) => row.role === "admin") || null);
		setMember(rows.filter((row) => row.role === "regular") || null);
	}, [rows]);




	return (
		<nav aria-label="secondary mailbox folders">
			<Typography variant="h6" component="div" gutterBottom> Admin </Typography>
			<List>
				{admin?.map((row) => (
					<ListItem disablePadding alignItems="flex-start">
						<ListItemAvatar>
							<Avatar alt={row.username} src={`/avatars/${row.id}.png`} />
						</ListItemAvatar>
						<ListItemButton >
							<ListItemText primary={row.username} />
						</ListItemButton>
						<ListItemAvatar>
							<Avatar sx={{ bgcolor: row.isConnected ? 'green' : 'red' }} style={{ width: '5px', height: '5px' }} />
						</ListItemAvatar>
					</ListItem>
				)
				)}
			</List>
			<Typography variant="h6" component="div" gutterBottom> Regular </Typography>
			<List>
				{member?.map((row) => (
					<ListItem disablePadding alignItems="flex-start">
						<ListItemAvatar>
							<Avatar alt={row.username} src={`/avatars/${row.id}.png`} />
						</ListItemAvatar>
						<ListItemButton >
							<ListItemText primary={row.username} />
						</ListItemButton>
						<ListItemAvatar>
							<Avatar sx={{ bgcolor: row.isConnected ? 'green' : 'red' }} style={{ width: '5px', height: '5px' }} />
						</ListItemAvatar>
					</ListItem>
				)
				)}
			</List>
		</nav>
	);
}
