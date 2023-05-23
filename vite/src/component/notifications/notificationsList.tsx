
import React, { useContext, useState } from 'react';
import { AppBar, Box, Button, Container, Grid, List, Pagination, Typography } from '@mui/material';
import { Notification } from '../../types';
import apiClient from '../../auth/interceptor.axios';
import { NotificationRequestFriend } from './notificationRequestFriend';
import { useAuthService } from '../../auth/AuthService';
import { SocketContext } from '../../socket/SocketProvider';
import { NotificationDirectMessage } from './notificationDirectMessage';
import { NotificationInvitation } from './notificationInvitation';



interface NotificationMap { [id: number]: Notification };

export function NotificationsList() {
	//send a post with image
	const [notifications, setNotifications] = React.useState<NotificationMap | null >(null);
	const [currentNotifications, setCurrentNotifications] = React.useState<Notification[] | null>(null); // notifications[currentPage
	const { customEmit, socket, customOn, customOff, addSubscription } = useContext(SocketContext);
	const auth = useAuthService();
	const [currentPage, setCurrentPage] = useState(1);


	React.useEffect(() => {
		apiClient.get("/api/notification/mynotifications").then((response) => {
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
			
		});
    }, [auth.user])

	React.useEffect(() => {
		if (!notifications) return;
		const indexOfLastItem = currentPage * 10;
		const indexOfFirstItem = indexOfLastItem - 10;
		setCurrentNotifications(Object.values(notifications)
		.sort((a, b) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		})	
		.slice(indexOfFirstItem, indexOfLastItem));
	}, [currentPage, notifications])

	React.useEffect(() => {
        if (!socket) return;

		const addNotification = (data: Notification) => {
			apiClient.post(`/api/notification/ack/${data.id}`).then((response) => {
			}).catch((error) => {
				
			});
			setNotifications((notifications) => {
				return { ...notifications, [data.id]: data };
			});
		}
		const deleteNotification = (id: number) => {
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
						{!currentNotifications? <Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, p: '25px' }}> You don't have any notifications yet </Typography> : null}
						<List
							sx={{
								overflow: 'auto',
							}}
						>
							{currentNotifications && Object.values(currentNotifications)
								.sort((a, b) => {
									return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
								})
								.map((notification: Notification, index, array) => {
									switch (notification.type) {
										case 'friendRequest':
											return (<NotificationRequestFriend key={notification.id} notification={notification} index={index} array={array} />)
										case 'directMessage':
											return (<NotificationDirectMessage key={notification.id} notification={notification} index={index} array={array} />)
										case 'channelInvitation':
											return (<NotificationInvitation key={notification.id} notification={notification} index={index} array={array} />)
										default
											: return <Box key = {notification.id}></Box>;
									}

								})}
						</List>
					</Box>
				</Box>
				{notifications && Object.values(notifications).length > 10 &&  <Grid container justifyContent="flex-end">
				{ currentPage !== 1 && <Button variant="outlined" onClick={() => {
					if (currentPage > 0) {
						setCurrentPage(currentPage - 1)
					}
				}}>Previous</Button>}
				<label style={{ padding: '5px 15px' }}>{currentPage}</label>
			{currentNotifications?.length === 10 && <Button variant="outlined" onClick={() => {
						setCurrentPage(currentPage + 1)
				}}>Next</Button>}
			</Grid>}
			</Container>
		</React.Fragment>
	)
}
