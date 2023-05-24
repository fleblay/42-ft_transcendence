
import React, { FC, useContext, useState } from 'react';
import { Avatar, Button, IconButton, ListItem, ListItemText, Typography, Theme } from '@mui/material';


import { Box } from '@mui/system';
import { Divider } from '@mui/material';
import { Friend, Notification, UserInfo } from '../../types';
import { SocketContext } from '../../socket/SocketProvider';
import { useAuthService } from '../../auth/AuthService';
import apiClient from '../../auth/interceptor.axios';
import { StyledBadge } from '../chat/ChatFriendsBrowser';
import { useNavigate } from 'react-router-dom';

import dayjs, { Dayjs } from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

interface NotificationRequestFriendProps {
	notification: Notification,
	index: number;
	array: Notification[];

}

export const NotificationRequestFriend: FC<NotificationRequestFriendProps> = ({ notification, index, array }) => {
	const { customEmit, socket, customOn, customOff, addSubscription } = useContext(SocketContext);
	const [friend, setFriend] = useState<Friend | null>();
	const auth = useAuthService();
	const navigate = useNavigate();


	React.useEffect(() => {
		return addSubscription(`/player/${notification.contentId}`);

	}, [socket]);

	React.useEffect(() => {
		apiClient.get(`/api/friends/${notification.contentId}`).then((response) => {
			setFriend(response.data);
		}).catch((error) => { });
	}, [notification.contentId])

	React.useEffect(() => {
		function onFriendUpdate({ userId, event }: { userId: number, event: string }) {
			switch (event) {
				case "connected":
					setFriend((oldFriend) => {
						if (!oldFriend) return oldFriend;
						return { ...oldFriend, online: true };
					});
					break;
				case "disconnected":
					setFriend((oldFriend) => {
						if (!oldFriend) return oldFriend;
						return { ...oldFriend, online: false };
					});
					break;
				default:
					break;

			}
		}
		customOn("page.player", onFriendUpdate);
		return () => {
			customOff("page.player", onFriendUpdate);
		}
	}, [friend])


	const handleAcceptFriend = () => {
		apiClient.post(`/api/friends/accept/${notification.contentId}`).then((response) => {
			if (response.data) {
				setFriend(response.data);
			}
		}).catch((error) => { });
	}

	const viewProfil = () => {
		navigate(`/player/${notification.contentId}`);
	}
	const RenderButton = () => {
		if (friend?.requestStatus === "accepted") {
			return (
				<>
					<Button variant="outlined" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={viewProfil}>View Profil</Button>
				</>)
		}
		else if (friend?.requestStatus === "pending") {
			return <Button variant="outlined" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={handleAcceptFriend}>Accept Request</Button>
		}
		else {
			return <Typography variant="body1" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }}>expired request</Typography>
		}
	}




	return (
		<React.Fragment>
			<ListItem key={notification.id} sx={{
				paddingTop: 0,
				paddingBottom: 0,
				borderBottom: array.length - 1 === index ? 1 : 0,
				borderTop: 1,
				borderColor: (theme: Theme) => theme.palette.grey[300]
			}}>

				<Avatar src={`/avatars/${notification.contentId}.png`} sx={{ margin: 1, width: '40px', height: '40px' }} />
				<ListItemText primary={notification.name} />
				<ListItemText secondary={ dayjs(notification.createdAt).fromNow() } />
				<RenderButton />
			</ListItem>
		</React.Fragment >
	)
}
