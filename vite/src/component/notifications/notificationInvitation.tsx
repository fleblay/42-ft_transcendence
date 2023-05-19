
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
import { blue } from '@mui/material/colors';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import { Announcement } from '@mui/icons-material';

import dayjs, { Dayjs } from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

interface NotificationInvitationProps {
    notification: Notification,
    index: number;
    array: Notification[];

}

export const NotificationInvitation: FC<NotificationInvitationProps> = ({ notification, index, array }) => {
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
                <Avatar sx={{ bgcolor: '#3F51B5', margin: 1, width: '40px', height: '40px' }}>
                    <Announcement />
                </Avatar>
                <ListItemText primary={"you are invited to " + notification.name} />
				<ListItemText secondary={ dayjs(notification.createdAt).fromNow() } />
                <Button variant="outlined" sx={{ ml: 'auto', mr: 1, mt: 2, mb: 2 }} onClick={viewMessage}>View Channel</Button>
            </ListItem>
        </React.Fragment >
    )
}
