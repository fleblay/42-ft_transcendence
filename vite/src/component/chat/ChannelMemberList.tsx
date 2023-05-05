import React, { useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { Avatar, Badge, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography, Menu, MenuItem, Button } from "@mui/material";
import { Link as LinkRouter, useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { Channel, Member } from "../../types";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useAuthService } from '../../auth/AuthService'

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
	const auth = useAuthService()
	const [memberList, setMemberList] = useState<memberList>(emptyMemberList);
	const me = React.useRef<Member | null>(null)

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
			if (auth.user)
				me.current = data.find((member) => member.user.id == auth.user!.id) || null
			console.log("Je suis : ", me.current)
		}).catch((error) => {
			console.log(error);
		});
	}, [channelId]);

	function GenerateMemberActionList({ member }: { member: Member }): JSX.Element {
		const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
		const open = Boolean(anchorEl);
		const navigate = useNavigate()
		const [myRights, setMyRights] = React.useState<string[]>([]);

		useEffect(() => {
			if (!me.current)
				return
			switch (me.current.role) {
				case "regular":
					setMyRights([""])
					break
				case "owner":
					setMyRights(["ban", "kick", "mute", "change"])
					break
				case "admin":
					member.role == "regular" && setMyRights(["ban", "kick", "mute"])
					member.role == "admin" && setMyRights(["ban", "kick", "mute"])
					member.role == "owner" && setMyRights([""])
					break
			}
		}, [me.current])

		const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			setAnchorEl(event.currentTarget);
		};

		const handleClose = () => {
			setAnchorEl(null);
		};

		const handleClickProfile = () => {
			navigate(`/player/${member.id}`);
		};

		const handleClickKick = () => {
			setAnchorEl(null);
		};

		const handleClickBan = () => {
			setAnchorEl(null);
		};

		const handleClickMute = () => {
			setAnchorEl(null);
		};

		const handleClickChangeRole = () => {
			setAnchorEl(null);
		};

		return (
			<div>
				<Button
					id="basic-button"
					aria-controls={open ? 'basic-menu' : undefined}
					aria-haspopup="true"
					aria-expanded={open ? 'true' : undefined}
					onClick={handleClick}
				>
					<ListItemIcon>
						<MoreHorizIcon />
					</ListItemIcon>
				</Button>

				<Menu
					id="basic-menu"
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
					MenuListProps={{
						'aria-labelledby': 'basic-button',
					}}
				>
					{myRights.includes("change") && <MenuItem onClick={handleClickChangeRole}>{`Change ${member.user.username}'s role`}</MenuItem>}
					{myRights.includes("kick") && <MenuItem onClick={handleClickKick}>{`Kick ${member.user.username}`}</MenuItem>}
					{myRights.includes("ban") && <MenuItem onClick={handleClickBan}>{`Ban ${member.user.username}`}</MenuItem>}
					{myRights.includes("mute") && <MenuItem onClick={handleClickMute}>{`Mute ${member.user.username}`}</MenuItem>}
					<MenuItem onClick={handleClickProfile}>{`${member.user.username}'s Profile`}</MenuItem>
				</Menu>
			</div>
		);
	}

	function GenerateMemberGroup({ groupname, groupMembers }: { groupname: string, groupMembers: Member[] }): JSX.Element {
		return (<>
			<Typography variant="h5" component="div" gutterBottom>{groupname}</Typography>
			<List>
				{groupMembers.map((member) => (
					<ListItem key={member.id} alignItems="flex-start">
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
						<GenerateMemberActionList member={member} />
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

