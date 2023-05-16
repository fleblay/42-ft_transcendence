
import React, { useContext, useState } from 'react';
import { AppBar, Box, Container, List, Typography } from '@mui/material';
import { Notification } from '../../types';
import apiClient from '../../auth/interceptor.axios';
import { NotificationRequestFriend } from './notificationRequestFriend';
import { useAuthService } from '../../auth/AuthService';
import { SocketContext } from '../../socket/SocketProvider';
import { NotificationDirectMessage } from './notificationDirectMessage';



interface NotificationMap { [id: number]: Notification };

export function NotificationsList() {
	//send a post with image
	const [notifications, setNotifications] = React.useState<NotificationMap | null >(null);
	const { customEmit, socket, customOn, customOff, addSubscription } = useContext(SocketContext);
	const auth = useAuthService();

	React.useEffect(() => {
		apiClient.get("/api/notification/myNotifications").then((response) => {
			console.log("notification : ", response);
			if (response.data.length === 0) {
				setNotifications(null);
				return;
			}
			let result: NotificationMap = response.data.reduce((map: NotificationMap, obj: Notification) => {
				map[obj.id] = obj;
				return map;
			}, {});
			setNotifications(result);
		}).catch((error) => {
			console.log(error);
		});
    }, [auth.user])

	React.useEffect(() => {
        if (!socket) return;

		const addNotification = (data: Notification) => {
			console.log("notification new in list", data);
			setNotifications((notifications) => {
				return { ...notifications, [data.id]: data };
			});
		}
		const deleteNotification = (id: number) => {
			console.log("notification delete", id);
			setNotifications((notifications) => {
				let newNotifications = { ...notifications };
				delete newNotifications[id];
				return newNotifications;
			});
		}

        customOn('notification.new', addNotification)
		customOn('notification.delete', deleteNotification);

        return (() => {
            customOff('notification.new', addNotification);
			customOff('notification.new', deleteNotification);
        })
    }, [socket]);

	return (
		<React.Fragment>
			<Container maxWidth="md" >
				<AppBar position="static"
					sx={({ shape }) => ({
						borderRadius: `${shape.borderRadius}px ${shape.borderRadius}px 0 0`,
						height: '80px'
					})}>
					<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px' }}>
						Notifications
					</Typography>
				</AppBar>
				<Box sx={({ shape }) => ({
					width: '100%',
					border: '1px solid #D3C6C6',
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
					borderRadius: `0 0 ${shape.borderRadius}px ${shape.borderRadius}px`,
					p: '2rem',
					bgcolor: 'background.paper',
					overflowY: 'scroll'
				})}>
					<Box position="static" sx={{ height: 'auto' }}>
						{!notifications ? <Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, p: '25px' }}> You don't have any notifications yet </Typography> : null}
						<List
							sx={{
								overflow: 'auto',
							}}
						>
							{notifications && Object.values(notifications)
								.sort((a, b) => {
									return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
								})
								.map((notification: Notification, index, array) => {
									console.log("notification", notification);
									switch (notification.type) {
										case 'friendRequest':
											return (<NotificationRequestFriend key={notification.id} notification={notification} index={index} array={array} />)
										case 'directMessage':
											return (<NotificationDirectMessage key={notification.id} notification={notification} index={index} array={array} />)
										default
											: return <Box key = {notification.id}></Box>;
									}

								})}
						</List>
					</Box>
				</Box>
			</Container>
		</React.Fragment>
	)
}