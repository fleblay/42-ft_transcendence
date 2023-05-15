
import React, { useContext, useState } from 'react';
import { AppBar, Box, Container, Typography } from '@mui/material';
import { Notification } from '../../types';
import apiClient from '../../auth/interceptor.axios';


export function NotificationsList() {
	//send a post with image
    const [notifications, setNotifications] = React.useState<null | Notification[]>(null);

    React.useEffect(() => {
        apiClient.get("/api/notification/myNotifications").then((response) => {
            console.log("frien received request", response);
            if (response.data.length === 0) {
                setNotifications(null);
                return;
            }
            console.log("response.data", response.data)
            setNotifications(response.data);
        }).catch((error) => {
            console.log(error);
        });
    }, [])

	return (
		<React.Fragment>
			<Container maxWidth="md" >
				<Box sx={{
					width: '100%',
					border: '1px solid #D3C6C6',
					boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
					borderRadius: '16px',
					bgcolor: 'background.paper',
				}}>
					<AppBar position="static" sx={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px', height: '80px' }}>
						<Typography textAlign="center" variant="h6" sx={{ flexGrow: 1, paddingTop: '25px' }}>
							notifications
						</Typography>
					</AppBar>
                </Box>
			</Container>
		</React.Fragment>
	)
}