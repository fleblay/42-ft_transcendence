import { Badge, Button, IconButton, Menu, MenuItem, MenuList, Typography } from "@mui/material"
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import React from "react";
import { Friend } from "../types";
import apiClient from "../auth/interceptor.axios";

export function NotifcationBar() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [friendRequest, setFriendRequest] = React.useState<null | Friend[]>(null);

    React.useEffect(() => {
        apiClient.get("/api/friends/received").then((response) => {
            console.log("frien received request", response);
            if (response.data.length === 0) {
                setFriendRequest(null);
                return;
            }
            setFriendRequest(response.data);
        }).catch((error) => {
            console.log(error);
        });
    }, [])

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (friendRequest === null )return;
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
  

    return (
        <>
            <IconButton  size="large"
            
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleClick}
                            color="inherit">
                 <Badge badgeContent={friendRequest?.length} color="error">

                <NotificationsNoneIcon color="inherit" />
                </Badge>

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
            {friendRequest && friendRequest?.map((friend) => {
                return (
                    <MenuItem key={friend.id}>
                        <Typography>{friend.username}</Typography>
                        <Button variant="contained" color="primary">Accept</Button>
                        <Button variant="contained" color="secondary">Decline</Button>
                    </MenuItem>
                )
            })}

      </Menu>
        </>)
}