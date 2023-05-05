import React, { useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import { Link as LinkRouter, useNavigate } from "react-router-dom";

import { Channel, Member } from "../../types";

export function MemberList({ channelId }: { channelId: string }) {
	const [rows, setRows] = useState<Member[]>([]);
	const [admin, setAdmin] = useState<Member[]>([]);
	const [member, setMember] = useState<Member[]>([]);

	useEffect(() => {
		apiClient.get(`/api/chat/channels/${channelId}/members`).then(({data}: {data: Member[]}) => {
			console.log("memberlist fetched : ", data);
			setRows(data);
		}).catch((error) => {
			console.log(error);
		});
	}, [channelId]);

	useEffect(() => {
		setAdmin(rows.filter((row) => row.role === "admin" || row.role === "owner"));
		setMember(rows.filter((row) => row.role === "regular"));
	}, [rows]);

	return (
		<nav aria-label="secondary mailbox folders">
			<Typography variant="h6" component="div" gutterBottom> Admin </Typography>
			<List>
				{admin?.map((admin) => (
					<ListItem key={admin.id} disablePadding alignItems="flex-start">
						<ListItemAvatar>
							<Avatar alt={admin.user.username} src={`/avatars/${admin.id}.png`} style={{width: '15px', height: '15px'}} />
						</ListItemAvatar>
						<ListItemButton >
							<ListItemText primary={admin.user.username} />
						</ListItemButton>
						<ListItemAvatar>
							<Avatar sx={{ bgcolor: admin.isConnected ? 'green' : 'red' }} style={{ width: '10px', height: '10px' }} />
						</ListItemAvatar>
					</ListItem>
				)
				)}
			</List>
			<Typography variant="h6" component="div" gutterBottom> Regular </Typography>
			<List>
				{member?.map((member) => (
					<ListItem key={member.id} disablePadding alignItems="flex-start">
						<ListItemAvatar>
							<Avatar alt={member.user.username} src={`/avatars/${member.id}.png`}  style={{width: '15px', height: '15px'}}/>
						</ListItemAvatar>
						<ListItemButton >
							<ListItemText primary={member.user.username} />
						</ListItemButton>
						<ListItemAvatar>
							<Avatar sx={{ bgcolor: member.isConnected ? 'green' : 'red' }} style={{ width: '10px', height: '10px' }} />
						</ListItemAvatar>
					</ListItem>
				)
				)}
			</List>
		</nav>
	);
}

