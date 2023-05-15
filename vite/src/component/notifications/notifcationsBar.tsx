import { Badge, Button, IconButton, Menu, MenuItem, MenuList, Typography } from "@mui/material"
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import React, { useContext } from "react";
import apiClient from "../../auth/interceptor.axios";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../socket/SocketProvider";
import { useAuthService } from "../../auth/AuthService";

export function NotifcationBar() {
    const [notifications, setNotifications] = React.useState<number>(0);
    const navigate = useNavigate();
    const { socket, customEmit, customOn, customOff, addSubscription } = useContext(SocketContext);
    const auth = useAuthService();

    React.useEffect(() => {
        apiClient.get("/api/notification/noRead").then((response) => {
            console.log("notifications no read", response);
            setNotifications(response.data);
                return;
        }).catch((error) => {
            console.log(error);
        });
        if (!auth.user) return;
        return addSubscription(`/notification/${auth.user.id}`);
    }, [auth.user])

    React.useEffect(() => {
        console.log("socket", socket)
        if (!socket) return;
        customOn('notification.new', (data: any) => {
            console.log("notification new", data);
            setNotifications((notifications) => notifications + 1);
        })
        return (() => {
            customOff('notification.new');
        })
    }, [socket]);

    

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        navigate("/notification");
    };

  

    return (
        <>
            <IconButton  size="large"
            
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleClick}
                            color="inherit">
                 <Badge badgeContent={notifications} color="error">

                <NotificationsNoneIcon color="inherit" />
                </Badge>

            </IconButton>
        </>)
}