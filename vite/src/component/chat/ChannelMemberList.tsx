import React, { useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { Avatar, Badge, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link as LinkRouter, useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { Channel, Member } from "../../types";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

type memberList = {
	admins: Member[],
	banned: Member[],
	muted: Member[],
	regulars: Member[],
}

const greenColor: string = "#44b700"
const redColor: string = "#ff0000"

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

	function GenerateMemberGroup({ groupname, groupMembers }: { groupname: string, groupMembers: Member[] }): JSX.Element {
		return (<>
			<Typography variant="h6" component="div" gutterBottom>{groupname}</Typography>
			<List>
				{groupMembers.map((member) => (
					<ListItem key={member.id}>
						<Badge
							overlap="circular"
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							variant="dot"
							sx={{
								"& .MuiBadge-badge": {
									backgroundColor: member.isConnected ? greenColor : redColor
								}
							}}
						>
							<Avatar alt="User Photo" src={`/avatars/${member.id}.png`} />
						</Badge>
						<ListItemText primary={member.user.username} />
						<ListItemButton >
							<ListItemIcon>
								<MoreHorizIcon />
							</ListItemIcon>
						</ListItemButton>
					</ListItem>
				)
				)}
			</List>
		</>)
	}

	return (
		<nav aria-label="secondary mailbox folders">
			<GenerateMemberGroup groupname={"Admin"} groupMembers={memberList.admins} />
			<GenerateMemberGroup groupname={"Users"} groupMembers={memberList.regulars} />
			<GenerateMemberGroup groupname={"Muted"} groupMembers={memberList.muted} />
			<GenerateMemberGroup groupname={"Banned"} groupMembers={memberList.banned} />
		</nav>
	);
}

