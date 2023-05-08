import React, { useContext, useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { Avatar, Badge, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography, Menu, MenuItem, Button } from "@mui/material";
import { Link as LinkRouter, useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { Channel, Member } from "../../types";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useAuthService } from '../../auth/AuthService'
import { SocketContext } from "../../socket/SocketProvider";

type memberList = {
	admins: Member[],
	banned: Member[],
	muted: Member[],
	regulars: Member[],
}

const greenColor: string = "#44b700"
const redColor: string = "#ff0000"
const emptyMemberList: memberList = { admins: [], banned: [], muted: [], regulars: [] }

function removeOldMember(olMemberId: number, memberList: memberList) : memberList{

	for (const [key, value] of Object.entries(memberList)) {
		console.log("in for loop : ", key, value)
		const oldMemberIndex: number = value.findIndex((member) => member.id == olMemberId)
		if (oldMemberIndex != -1) {
			console.log("Found oldmember in :", key)
			value.splice(oldMemberIndex, 1)
			break
		}
	}
	return({
		admins: [...memberList.admins],
		banned: [...memberList.banned],
		muted: [...memberList.muted],
		regulars: [...memberList.regulars],
	})
}

function addNewMember(newMember: Member, memberList: memberList) : memberList{
	if (newMember.role == "admin")
		memberList.admins.push(newMember)
	else if (newMember.banned)
		memberList.banned.push(newMember)
	else if (Date.parse(newMember.muteTime) > Date.now())
		memberList.muted.push(newMember)
	else if (!newMember.left)
		memberList.regulars.push(newMember)
	console.log("new member list", memberList)
	return({
		admins: [...memberList.admins],
		banned: [...memberList.banned],
		muted: [...memberList.muted],
		regulars: [...memberList.regulars],
	})
}

export function MemberList({ channelId }: { channelId: string }) {
	const auth = useAuthService()
	const { customOn, customOff, addSubscription } = useContext(SocketContext);
	const [memberList, setMemberList] = useState<memberList>(emptyMemberList);
	const me = React.useRef<Member | null>(null)
	const navigate = useNavigate()

	useEffect(() => {
		return addSubscription(`/chat/${channelId}`);
	}, [channelId]);

	//On track sur memberList car au premier render, elle a la valeur emptyMemberList
	//On ajout un on sur l'event chat.member.update
	//Le call back prend en param la memberList qui est update apres le premier api.Client.get
	useEffect(() => {
		function onMemberUpdate({ modifyMember: upDatedMember }: { modifyMember: Member }) {
			console.log("onMemberUpdate", upDatedMember);
			removeOldMember(upDatedMember.id, memberList)
			setMemberList(addNewMember(upDatedMember, memberList))
			if (upDatedMember.id == me.current!.id && upDatedMember.left)
				navigate(`/chat`);
		}

		function onMemberJoin({joinedMember}: { joinedMember: Member }) {
			console.log("onMemberJoin", joinedMember);
			setMemberList(addNewMember(joinedMember, memberList))
		}

		function onMemberLeave({leftMember}: { leftMember: Member }) {
			console.log("onMemberLeft", leftMember, me.current);
			setMemberList(removeOldMember(leftMember.id, memberList))
		}

		customOn("chat.modify.members", onMemberUpdate);
		customOn("chat.member.new", onMemberJoin);
		customOn("chat.member.leave", onMemberLeave);
		return () => {
			customOff("chat.modify.members", onMemberUpdate);
			customOff("chat.member.new", onMemberJoin);
			customOn("chat.member.leave", onMemberLeave);
		};
	}, [memberList])

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
					&& !newMemberList.muted.includes(member)
					&& !member.left)
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
					(member.role != "owner") ? setMyRights(["ban", "kick", "mute", "change"]) : setMyRights([""])
					break
				case "admin":
					member.role == "regular" && setMyRights(["ban", "kick", "mute"])
					member.role == "admin" && setMyRights(["ban", "kick", "mute"])
					member.role == "owner" && setMyRights([""])
					break
			}
		}, [me.current, memberList])

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
			apiClient.post(`/api/chat/channels/${channelId}/members/${member.id}`, { kick: true }).
				then(() => console.log("Kick : OK"))
				.catch((error) => {
					console.log(error);
				});
		};

		const handleClickBan = () => {
			apiClient.post(`/api/chat/channels/${channelId}/members/${member.id}`, { ban: (!member.banned) }).
				then(() => console.log("Ban : OK"))
				.catch((error) => {
					console.log(error);
				});
			setAnchorEl(null);
		};

		const handleClickMute = () => {
			let muteEnd = new Date()
			if (Date.parse(member.muteTime) < Date.now()) {
				//A faire proprement avec une modale
				muteEnd.setDate(muteEnd.getDate() + 1)
			}
			else
				muteEnd.setFullYear(1970)

			apiClient.post(`/api/chat/channels/${channelId}/members/${member.id}`, { mute: muteEnd.toISOString() }).
				then(() => console.log(`Mute till ${muteEnd.toISOString()}: OK`))
				.catch((error) => {
					console.log(error);
				});
			setAnchorEl(null);
		};

		const handleClickChangeRole = () => {
			apiClient.post(`/api/chat/channels/${channelId}/members/${member.id}`, { role: "regular" }).
				then(() => console.log("Change role to regular: OK"))
				.catch((error) => {
					console.log(error);
				});
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
					{myRights.includes("ban") && <MenuItem onClick={handleClickBan}>{`${member.banned ? "Unban" : "Ban"} ${member.user.username}`}</MenuItem>}
					{myRights.includes("mute") && <MenuItem onClick={handleClickMute}>{`${Date.parse(member.muteTime) > Date.now() ? "Unmute" : "Mute"} ${member.user.username}`}</MenuItem>}
					<MenuItem onClick={handleClickProfile}>{`${member.user.username}'s Profile`}</MenuItem>
				</Menu>
			</div>
		);
	}

	function GenerateMemberGroup({ groupname, groupMembers }: { groupname: string, groupMembers: Member[] }): JSX.Element {
		return (<>
			<Typography variant="h5" component="div" gutterBottom>{groupname}</Typography>
			<List component="div" disablePadding sx={{
				width: '100%',
				position: 'relative',
				overflow: 'auto',
				maxHeight: 300,
			}}>
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
						{member.role == "owner" && <ListItemIcon><StarBorderIcon /></ListItemIcon>}
						{(Date.parse(member.muteTime) > Date.now()) && <ListItemIcon><VolumeOffIcon /></ListItemIcon>}
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

