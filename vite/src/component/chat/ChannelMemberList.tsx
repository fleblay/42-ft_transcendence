import React, { useContext, useEffect, useState } from "react";
import apiClient from "../../auth/interceptor.axios";
import { Avatar, Badge, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography, Menu, MenuItem, Button, Grid, IconButton, Modal } from "@mui/material";
import { Link as LinkRouter, useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';
import { Channel, Member } from "../../types";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useAuthService } from '../../auth/AuthService'
import { SocketContext } from "../../socket/SocketProvider";
import { MuteMemberModal } from "./MuteMemberModal";

type memberList = {
	admins: Member[],
	banned: Member[],
	muted: Member[],
	regulars: Member[],
}

const greenColor: string = "#44b700"
const redColor: string = "#ff0000"
const emptyMemberList: memberList = { admins: [], banned: [], muted: [], regulars: [] }

function removeOldMember(olMemberId: number, memberList: memberList): memberList {

	for (const [key, value] of Object.entries(memberList)) {
		console.log("in for loop : ", key, value)
		const oldMemberIndex: number = value.findIndex((member) => member.id == olMemberId)
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
	if (newMember.role == "admin")
		memberList.admins.push(newMember)
	else if (newMember.banned)
		memberList.banned.push(newMember)
	else if (Date.parse(newMember.muteTime) > Date.now())
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
			if (upDatedMember.id == me.current!.id) {
				console.log("I have changed : ", upDatedMember)
				me.current = upDatedMember
				if (upDatedMember.left)
					navigate(`/chat`);
			}
		}

		function onMemberJoin({ joinedMember }: { joinedMember: Member }) {
			console.log("onMemberJoin", joinedMember);
			setMemberList(addNewMember(joinedMember, memberList))
		}

		function onMemberLeave({ leftMember }: { leftMember: Member }) {
			console.log("onMemberLeft", leftMember, me.current);
			setMemberList(removeOldMember(leftMember.id, memberList))
		}

		customOn("chat.modify.members", onMemberUpdate);
		customOn("chat.member.new", onMemberJoin);
		customOn("chat.member.leave", onMemberLeave);
		return (() => {
			customOff("chat.modify.members", onMemberUpdate);
			customOff("chat.member.new", onMemberJoin);
			customOff("chat.member.leave", onMemberLeave);
		})
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
		const mutedState: boolean = Date.parse(member.muteTime) > Date.now()

		//Modal
		const [muteModalOpen, setMuteModalOpen] = React.useState<boolean>(false)

		function closeMuteModal(): void {
			setMuteModalOpen(false)
			handleClose()
		}

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
		}, [me.current?.role, memberList, member.role])

		const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			setAnchorEl(event.currentTarget);
		};

		const handleClose = () => {
			setAnchorEl(null);
		};

		const handleClickProfile = () => {
			navigate(`/player/${member.user.id}`);
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
			<span>
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
					<MenuItem onClick={handleClickProfile}>{`${member.user.username}'s Profile`}</MenuItem>
					{myRights.includes("change") && <MenuItem onClick={handleClickChangeRole}>{`Change ${member.user.username}'s role to ${member.role == "regular" ? "admin" : "regular"}`}</MenuItem>}
					{myRights.includes("kick") && <MenuItem onClick={handleClickKick}>{`Kick ${member.user.username}`}</MenuItem>}
					{myRights.includes("ban") && <MenuItem onClick={handleClickBan}>{`${member.banned ? "Unban" : "Ban"} ${member.user.username}`}</MenuItem>}
					{myRights.includes("mute") && mutedState && <MenuItem onClick={handleClickUnMute}>{`Unmute ${member.user.username}`}</MenuItem>}
					{myRights.includes("mute") && !mutedState && <MenuItem onClick={() => setMuteModalOpen(true)}>{`Mute ${member.user.username}`}</MenuItem>}
					<MuteMemberModal openModal={muteModalOpen} onClose={closeMuteModal} channelId={channelId} member={member} />
				</Menu>
			</span>
		);
	}

	function GenerateMemberGroup({ groupname, groupMembers }: { groupname: string, groupMembers: Member[] }): JSX.Element {
		return (<>
			<Typography component="div" gutterBottom>{groupname}</Typography>
			<List>
				{groupMembers.map((member) => (
					<ListItem key={member.id} >
						<Grid container wrap="nowrap" direction="row" justifyContent="flex-start" alignItems="center">
							<Grid item xs>
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
							</Grid>
							<Grid item xs={8}>
								<ListItemText primary={member.user.username} />
								<ListItemIcon>{member.role == "owner" && <StarBorderIcon />}</ListItemIcon>
								<ListItemIcon>{(Date.parse(member.muteTime) > Date.now()) && <VolumeOffIcon />}</ListItemIcon>
							</Grid>
							<Grid item xs>
								<GenerateMemberActionList member={member} />
							</Grid>
						</Grid>
					</ListItem>
				)
				)}
			</List>
		</>)
	}

	return (
		<nav>
			<GenerateMemberGroup groupname={"Admins"} groupMembers={memberList.admins} />
			<GenerateMemberGroup groupname={"Users"} groupMembers={memberList.regulars} />
			<GenerateMemberGroup groupname={"Muted"} groupMembers={memberList.muted} />
			<GenerateMemberGroup groupname={"Banned"} groupMembers={memberList.banned} />
		</nav>
	);
}

