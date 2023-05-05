import React, { useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import { Link as LinkRouter, useNavigate } from "react-router-dom";

import { Channel, Member } from "../../types";

type memberList = {
	admins: Member[],
	banned: Member[],
	muted: Member[],
	regulars: Member[],
}

const emptyMemberList: memberList = { admins: [], banned: [], muted: [], regulars: [] }

export function MemberList({ channelId }: { channelId: string }) {
	const [memberList, setMemberList] = useState<memberList>(emptyMemberList);

	useEffect(() => {
		apiClient.get(`/api/chat/channels/${channelId}/members`).then(({ data }: { data: Member[] }) => {
			console.log("memberlist fetched : ", data);
			const newMemberList: memberList = {
				admins: data.filter((member) => member.role == "admin" || member.role == "owner"),
				banned: data.filter((member) => member.banned),
				muted: data.filter((member) => Date.parse(member.muteTime) > Date.now()),
				regulars: []
			}
			newMemberList.regulars = data.filter((member) => {
				return (!newMemberList.admins.includes(member)
					&& !newMemberList.banned.includes(member)
					&& !newMemberList.muted.includes(member))
			})
			setMemberList(newMemberList)
		}).catch((error) => {
			console.log(error);
		});
	}, [channelId]);

	return (
		<nav aria-label="secondary mailbox folders">
			<Typography variant="h6" component="div" gutterBottom> Admin </Typography>
			<List>
				{memberList.admins.map((admin) => (
					<ListItem key={admin.id} disablePadding alignItems="flex-start">
						<ListItemAvatar>
							<Avatar alt={admin.user.username} src={`/avatars/${admin.id}.png`} style={{ width: '15px', height: '15px' }} />
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
			<List>
				{memberList.regulars.map((regular) => (
					<ListItem key={regular.id} disablePadding alignItems="flex-start">
						<ListItemAvatar>
							<Avatar alt={regular.user.username} src={`/avatars/${regular.id}.png`} style={{ width: '15px', height: '15px' }} />
						</ListItemAvatar>
						<ListItemButton >
							<ListItemText primary={regular.user.username} />
						</ListItemButton>
						<ListItemAvatar>
							<Avatar sx={{ bgcolor: regular.isConnected ? 'green' : 'red' }} style={{ width: '10px', height: '10px' }} />
						</ListItemAvatar>
					</ListItem>
				)
				)}
			</List>
		</nav>
	);
}

