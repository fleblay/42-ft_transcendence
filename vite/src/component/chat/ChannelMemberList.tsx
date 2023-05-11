import React, { Dispatch, MutableRefObject, SetStateAction, useContext, useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { Avatar, Badge, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography, Menu, MenuItem, Button, Grid, IconButton, Modal, Box, Divider } from "@mui/material";
import { Link as LinkRouter, useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { Channel, Member } from "../../types";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import BlockIcon from '@mui/icons-material/Block';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuthService } from '../../auth/AuthService'
import { SocketContext } from "../../socket/SocketProvider";
import { MuteMemberModal } from "./MuteMemberModal";
import { joinDm } from "./ChatDirectMessageList"
import { handleBlockUser, handleUnblockUser } from "../UserInfoDisplay"

type memberList = {
	admins: Member[],
	banned: Member[],
	muted: Member[],
	regulars: Member[],
}

const greenColor: string = "#44b700"
const redColor: string = "#ff0000"
const emptyMemberList: memberList = { admins: [], banned: [], muted: [], regulars: [] }

function userUpDateState(me: Member | null, setMe: Dispatch<SetStateAction<Member | null>>, userId: number, event: string, memberList: memberList, targetId?: number): memberList {

	for (const [key, value] of Object.entries(memberList)) {
		const member: Member | undefined = value.find((member) => member.user.id == userId)
		if (member) {
			console.log("Found user in :", key)
			console.log("event is :", event)
			switch (event) {
				case ("leave"):
					member.states.pop()
					break
				case ("ingame"):
					member.states.push(event)
					break
				case ("watching"):
					member.states.push(event)
					break
				case ("connected"):
					member.isConnected = true
					break
				case ("disconnected"):
					member.isConnected = false
					break
				case ("blocked"):
					if (me != null && targetId != undefined && me.user.id == userId)
						me.user.blockedId.push(targetId)
					setMe(me)
					break
				case ("unblocked"):
					if (me != null && targetId != undefined && me.user.id == userId)
						me.user.blockedId = me.user.blockedId.filter((blocked) => blocked != targetId)
					setMe(me)
					break
				case ("me-blocked"):
					if (me != null && targetId && userId == me.user.id)
						me.user.blockedId.push(targetId)
					setMe(me)
					break
				case ("me-unblocked"):
					if (me != null && targetId && userId == me.user.id)
						me.user.blockedId = me.user.blockedId.filter((blocked) => blocked != targetId)
					setMe(me)
					break
				case ("accept"):
					if (me != null && targetId != undefined && me.user.id == userId)
						me.user.friendId.push(targetId)
					setMe(me)
					break
				case ("remove"):
					if (me != null && targetId != undefined && me.user.id == userId)
						me.user.friendId = me.user.friendId.filter((friend) => friend != targetId)
					setMe(me)
					break
				case ("me-accept"):
					if (me != null && targetId && targetId == me.user.id)
						me.user.friendId.push(userId)
					setMe(me)
					break
				case ("me-remove"):
					if (me != null && targetId && targetId == me.user.id)
						me.user.friendId = me.user.friendId.filter((friend) => friend != userId)
					setMe(me)
					break
			}
		}
	}
	return ({
		admins: [...memberList.admins],
		banned: [...memberList.banned],
		muted: [...memberList.muted],
		regulars: [...memberList.regulars],
	})
}

function subscribeToMemberEvents(addSubscription: (sub: string) => (() => void) | void, memberList: memberList): ((() => void) | void)[] {

	const fxArray: ((() => void) | void)[] = []

	for (const [key, value] of Object.entries(memberList)) {
		value.forEach((member) => {
			fxArray.push(addSubscription(`/player/${member.user.id}`))
		})
	}
	return fxArray
}

function removeOldMember(oldMemberId: number, memberList: memberList): memberList {

	for (const [key, value] of Object.entries(memberList)) {
		const oldMemberIndex: number = value.findIndex((member) => member.id == oldMemberId)
		if (oldMemberIndex != -1) {
			console.log("Found oldmember in :", key)
			value.splice(oldMemberIndex, 1)
			break
		}
	}
	return ({
		admins: [...memberList.admins],
		banned: [...memberList.banned],
		muted: [...memberList.muted],
		regulars: [...memberList.regulars],
	})
}

function addNewMember(newMember: Member, memberList: memberList): memberList {
	console.log("newMember : ", newMember)
	if ((newMember.role == "admin" || newMember.role == "owner") && !newMember.left)
		memberList.admins.push(newMember)
	else if (newMember.banned)
		memberList.banned.push(newMember)
	else if ((Date.parse(newMember.muteTime) > Date.now()) && !newMember.left)
		memberList.muted.push(newMember)
	else if (!newMember.left)
		memberList.regulars.push(newMember)
	console.log("new member list", memberList)
	return ({
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
	const [me, setMe] = useState<Member | null>(null);
	const navigate = useNavigate()

	//On track sur memberList car au premier render, elle a la valeur emptyMemberList
	//On ajout un on sur l'event chat.member.update
	//Le call back prend en param la memberList qui est update apres le premier api.Client.get
	useEffect(() => {
		function onMemberUpdate({ modifyMember: upDatedMember }: { modifyMember: Member }) {
			console.log("onMemberUpdate", upDatedMember);
			removeOldMember(upDatedMember.id, memberList)
			setMemberList(addNewMember(upDatedMember, memberList))
			if (upDatedMember.id == me!.id) {
				console.log("I have changed : ", upDatedMember)
					setMe(upDatedMember)
				if (upDatedMember.left)
					navigate(`/chat`);
			}
		}

		function onMemberJoin({ joinedMember }: { joinedMember: Member }) {
			console.log("onMemberJoin", joinedMember);
			setMemberList(addNewMember(joinedMember, memberList))
		}

		function onMemberLeave({ leftMember }: { leftMember: Member }) {
			console.log("onMemberLeft", leftMember, me);
			setMemberList(removeOldMember(leftMember.id, memberList))
		}

		function onPlayerEvent({ userId, event, targetId }: { userId: number, targetId?: number, event: string }) {
			if (!userId || !event)
				return
			console.log("onPlayerEvent", userId, event);
			setMemberList(userUpDateState(me, setMe, userId, event, memberList, targetId))
		}

		customOn("chat.modify.members", onMemberUpdate);
		customOn("chat.member.new", onMemberJoin);
		customOn("chat.member.leave", onMemberLeave);
		customOn("page.player", onPlayerEvent);
		const fxArray: ((() => void) | void)[] = subscribeToMemberEvents(addSubscription, memberList)
		return (() => {
			customOff("chat.modify.members", onMemberUpdate);
			customOff("chat.member.new", onMemberJoin);
			customOff("chat.member.leave", onMemberLeave);
			customOff("page.player", onPlayerEvent);
			fxArray.forEach(fx => {
				if (typeof fx === "function")
					fx()
			})
		})
	}, [memberList])


	useEffect(() => {
		apiClient.get(`/api/chat/channels/${channelId}/members`).then(({ data }: { data: Member[] }) => {
			console.log("memberlist fetched is: ", data);
			const newMemberList: memberList = {
				admins: data.filter((member) => ((member.role == "admin" || member.role == "owner")) && !member.left),
				banned: data.filter((member) => member.banned),
				muted: data.filter((member) => (Date.parse(member.muteTime) > Date.now()) && !member.left),
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
				setMe(data.find((member) => member.user.id == auth.user!.id) || null)
			console.log("Je suis : ", me)
		}).catch((error) => {
			console.log(error);
		});
	}, [channelId]);

	function GenerateMemberActionList({ member }: { member: Member }): JSX.Element {
		const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
		const open = Boolean(anchorEl);
		const navigate = useNavigate()
		const [myRights, setMyRights] = React.useState<string[]>([]);
		const mutedState: boolean = Date.parse(member.muteTime) > Date.now()

		//Modal
		const [muteModalOpen, setMuteModalOpen] = React.useState<boolean>(false)

		function closeMuteModal(): void {
			setMuteModalOpen(false)
			handleClose()
		}

		useEffect(() => {
			const relationRights: string[] = []
			const priviledgeRights: string[] = []
			if (!me)
				return
			if (me.id == member.id) {
				setMyRights(["self"])
				return
			}
			switch (me.role) {
				case "owner":
					(member.role != "owner") && priviledgeRights.push("ban", "kick", "mute", "change")
					break
				case "admin":
					member.role == "regular" && priviledgeRights.push("ban", "kick", "mute")
					member.role == "admin" && priviledgeRights.push("ban", "kick", "mute")
					break
			}
			if (me.user.friendId.includes(member.user.id))
				relationRights.push("friend")
			relationRights.push((me.user.blockedId.includes(member.user.id)) ? "unblock" : "block")
			setMyRights([...relationRights, ...priviledgeRights])
		}, [me, memberList, member.role])

		const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			setAnchorEl(event.currentTarget);
		};

		const handleClose = () => {
			setAnchorEl(null);
		};

		const handleClickProfile = () => {
			navigate(`/player/${member.user.id}`);
		};

		const handleClickLeave = () => {
			setAnchorEl(null);
			apiClient.post(`/api/chat/channels/${channelId}/leave`, { kick: true }).
				then(() => console.log("Leave : OK"))
				.catch((error) => {
					console.log(error);
				});
			navigate(`/chat/`);
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
			if (!member.banned) {
				apiClient.post(`/api/chat/channels/${channelId}/members/${member.id}`, { kick: true }).
					then(() => console.log("Ban : OK"))
					.catch((error) => {
						console.log(error);
					});
			}
			setAnchorEl(null);
		};

		const handleClickUnMute = () => {
			const muteEnd = new Date()
			muteEnd.setFullYear(1970)

			apiClient.post(`/api/chat/channels/${channelId}/members/${member.id}`, { mute: muteEnd.toISOString() }).
				then(() => console.log(`Mute till ${muteEnd.toISOString()}: OK`))
				.catch((error) => {
					console.log(error);
				});
			setAnchorEl(null);
		};

		const handleClickChangeRole = () => {
			apiClient.post(`/api/chat/channels/${channelId}/members/${member.id}`, { role: (member.role == "regular") ? "admin" : "regular" }).
				then(() => console.log("Change role OK"))
				.catch((error) => {
					console.log(error);
				});
			setAnchorEl(null);
		};

		return (
			<>
				<IconButton
					id="basic-button"
					aria-controls={open ? 'basic-menu' : undefined}
					aria-haspopup="true"
					aria-expanded={open ? 'true' : undefined}
					onClick={handleClick}
					style={{ height: "40px", width: "40px" }}
				>
					<MoreHorizIcon />
				</IconButton>
				<Menu
					id="basic-menu"
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
					MenuListProps={{
						'aria-labelledby': 'basic-button',
					}}
				>
					<MenuItem onClick={handleClickProfile}>{`${(member.id != me?.id) ? member.user.username + "'s" : "My"} Profile`}</MenuItem>
					{myRights.includes("self") && <MenuItem onClick={handleClickLeave}>Leave Channel</MenuItem>}
					{myRights.includes("change") && <MenuItem onClick={handleClickChangeRole}>{`Change ${member.user.username}'s role to ${member.role == "regular" ? "admin" : "regular"}`}</MenuItem>}
					{myRights.includes("kick") && <MenuItem onClick={handleClickKick}>{`Kick ${member.user.username}`}</MenuItem>}
					{myRights.includes("ban") && <MenuItem onClick={handleClickBan}>{`${member.banned ? "Unban" : "Ban"} ${member.user.username}`}</MenuItem>}
					{myRights.includes("mute") && mutedState && <MenuItem onClick={handleClickUnMute}>{`Unmute ${member.user.username}`}</MenuItem>}
					{myRights.includes("mute") && !mutedState && <MenuItem onClick={() => setMuteModalOpen(true)}>{`Mute ${member.user.username}`}</MenuItem>}
					{myRights.includes("friend") && <MenuItem onClick={() => joinDm(member.user.id, navigate)}>{`Send ${member.user.username} a DM`}</MenuItem>}
					{myRights.includes("unblock") && <MenuItem onClick={() => handleUnblockUser(member.user.id.toString())}>{`Unblock ${member.user.username}`}</MenuItem>}
					{myRights.includes("block") && <MenuItem onClick={() => handleBlockUser(member.user.id.toString())}>{`Block ${member.user.username}`}</MenuItem>}
					<MuteMemberModal openModal={muteModalOpen} onClose={closeMuteModal} channelId={channelId} member={member} />
				</Menu>
			</>
		);
	}

	function GenerateMemberGroup({ groupname, groupMembers, me }: { groupname: string, groupMembers: Member[], me: Member | null }): JSX.Element {
		console.log('rendering membergroup, me is : ', me)
		return (<>
			<Typography component="div">{groupname}</Typography>
			<List disablePadding>
				{groupMembers.map((member) => (
					<ListItem sx={{ gap: 1 }} disableGutters key={member.id}
					>
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
							<Avatar alt="User Photo" src={`/avatars/${member.user.id}.png`} />
						</Badge>

						<Box sx={{ display: "flex", alignContent: "center" }} >
							{`${member.user.username}`}
							{member.role == "owner" && <MilitaryTechIcon />}
							{(Date.parse(member.muteTime) > Date.now()) && <VolumeOffIcon />}
							{member.states.includes("ingame") && <VideogameAssetIcon />}
							{member.states.includes("watching") && <VisibilityIcon />}
							{me?.user.blockedId.includes(member.user.id) && <BlockIcon />}
							{me?.user.friendId.includes(member.user.id) && <FavoriteBorderIcon />}
						</Box>
						<Box sx={{ marginLeft: "auto" }}>
							<GenerateMemberActionList member={member} />
						</Box>
					</ListItem>
				)
				)}
			</List>
		</>)
	}

	return (
		<nav>
			<GenerateMemberGroup groupname={"Admins"} groupMembers={memberList.admins} me={me} />
			<Divider />
			<GenerateMemberGroup groupname={"Users"} groupMembers={memberList.regulars} me={me} />
			<Divider />
			<GenerateMemberGroup groupname={"Muted"} groupMembers={memberList.muted} me={me} />
			<Divider />
			<GenerateMemberGroup groupname={"Banned"} groupMembers={memberList.banned} me={me} />
		</nav>
	);
}

