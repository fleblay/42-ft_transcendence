import { Badge, Button, IconButton, Menu, MenuItem, MenuList, Typography } from "@mui/material"
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import React, { useContext } from "react";
import apiClient from "../../auth/interceptor.axios";
import { useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../../socket/SocketProvider";
import { useAuthService } from "../../auth/AuthService";
import { Notification } from "../../types";

export function NotifcationBar() {
    const [notifications, setNotifications] = React.useState<number>(0);
    const navigate = useNavigate();
    const { socket, customEmit, customOn, customOff, addSubscription } = useContext(SocketContext);
    const auth = useAuthService();
    const [currentLocation, setCurrentLocation] = React.useState("");
    const location = useLocation();


    React.useEffect(() => {
        setCurrentLocation(location.pathname);
    }, [location])

    React.useEffect(() => {
        apiClient.get("/api/notification/noread").then((response) => {
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
        const addBellNotification = (data: Notification) => {
            console.log("notification new bell", data);
            console.log("location", currentLocation);
            if (currentLocation === `/chat/${data.contentId}` && data.type === "directMessage")
            {
                console.log("ack");
                apiClient.post(`/api/notification/ack/${data.id}`).then((response) => {
                    console.log("notification ack", response);
                }
                ).catch((error) => {
                    console.log(error);
                });
                return;
            }
            if (currentLocation === "/notification")
                return;
            setNotifications((notifications) => notifications + 1);
        }
        const dellBellNotification = (data: Notification | number) => {
            setNotifications((notifications) => {
                    if (notifications === 0)
                        return notifications;
                    return notifications - 1;});
        }
        customOn('notification.new', addBellNotification)
        customOn('notification.ack', dellBellNotification)
        customOn('notification.delete', dellBellNotification);


        return (() => {
            customOff('notification.delete', dellBellNotification);
            customOff('notification.new', addBellNotification);
            customOff('notification.ack', dellBellNotification);
        })
    }, [socket, currentLocation]);

    

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setNotifications(0);
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
