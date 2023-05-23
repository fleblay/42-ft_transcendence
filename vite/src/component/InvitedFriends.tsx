import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from '../socket/SocketProvider';
import { IconButton, Menu, MenuItem } from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import apiClient from "../auth/interceptor.axios";
import { Channel, Member } from "../types";
import { useAuthService } from "../auth/AuthService";
import { useParams } from "react-router-dom";

interface InvitedFriendsProps {
    isConnected?: boolean;
    type : "game" | "chat";
    invited?: { [id: number]: boolean };
}

export function InvitedFriends({isConnected = false, type, invited}: InvitedFriendsProps) {
    
    type ShortDMChannel = { id: number, friend: Member }
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [dmChannelsList, setDMChannelsList] = useState<null | ShortDMChannel[]>(null);
	const [invitedFriends, setInvitedFriends] = useState<{ [id: number]: boolean }>(invited || {});
	const auth = useAuthService();
	const { channelId } = useParams();
    const { idGame } = useParams<{ idGame: string }>();

    useEffect(() => {
        if (invited)
            setInvitedFriends(invited);
    }, [invited])

	function inviteFriend(dmChannel: ShortDMChannel, username: string) {
		if (!dmChannel) return;
        if (idGame && type === "game")
            apiClient.post(`/api/chat/channels/${dmChannel.id}/messages`, { content: `Join my private game.`, gameId: idGame })
        if (channelId && type === "chat")
            apiClient.post(`/api/chat/channels/${channelId}/join`, {
			username: username,
		});
		setInvitedFriends({ ...invitedFriends, [dmChannel.friend.user.id]: true })
		closeFriendsList();
	}

	function fetchFriendsList() {
		apiClient.get<Channel[]>('/api/chat/channels/dm').then(({ data }) => {
			const channelsList: ShortDMChannel[] = data.map((channel) => ({
				id: channel.id,
				friend: channel.members.find((member) => member.user.id !== auth.user?.id),
			})).filter(channel => channel.friend) as ShortDMChannel[]
            if (isConnected)
                setDMChannelsList(channelsList.filter(channel => channel.friend.isConnected));
            else 
                setDMChannelsList(channelsList);
		})
	}

	function handleFriendsList(event: React.MouseEvent<HTMLButtonElement>) {
		fetchFriendsList();
		setAnchorEl(event.currentTarget);
	}
	
	function closeFriendsList() {
		setAnchorEl(null);
	}
    
    return (
        <>
            <IconButton color="primary" sx={{ ml: 2 }} size='small' onClick={handleFriendsList}>
                Invite a friend 
                <PersonAdd />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={anchorEl !== null}
                onClose={closeFriendsList}
            >
                {
                    dmChannelsList?.length
                        ? dmChannelsList.map((channel) => (
                            <MenuItem key={channel.friend.user.id}
                                disabled={invitedFriends[channel.friend.user.id]}
                                onClick={() => inviteFriend(channel, channel.friend.user.username)}
                            >{`Invite ${channel.friend.user.username}`}

                            </MenuItem>
                        ))
                        : <MenuItem disabled>No friends</MenuItem>
                }
            </Menu>

        </>
    )
}
