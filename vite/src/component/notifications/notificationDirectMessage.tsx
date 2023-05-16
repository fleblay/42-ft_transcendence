
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
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';


interface NotificationDirectMessageProps {
    notification: Notification,
    index: number;
    array: Notification[];

}





export const NotificationDirectMessage: FC<NotificationDirectMessageProps> = ({ notification, index, array }) => {
    const navigate = useNavigate();

    const viewMessage = () => {
        console.log("viewMessage", notification.contentId);
        navigate(`/chat/${notification.contentId}`);
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
                <Avatar sx={{ bgcolor: "primary", margin: 1, width: '40px', height: '40px' }}>
                    <MessageOutlinedIcon />
                </Avatar>
                <ListItemText primary={notification.name} />
                <ListItemText primary="sent you a message" />
                <ListItemText primary={notification.createdAt.toString()} />
                <Button variant="outlined" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={viewMessage}>View Message</Button>
            </ListItem>
        </React.Fragment >
    )
}
