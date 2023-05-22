import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import { Box, Button, Modal } from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import Cloud from '@mui/icons-material/Cloud';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../auth/interceptor.axios';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { MyChannelsList } from './ChannelsList';
import { CreateChannelModal } from './CreatChannelModal';
import { ViewDayRounded } from '@mui/icons-material';
import { MyDirectMessageList } from './ChatDirectMessageList';

export default function ChatMenu() {
	const [friendMenu, setFriendMenu] = React.useState<boolean>(false);
	const [roomsMenu, setRoomsMenu] = React.useState<boolean>(false);
	const [openCreateChannel, setOpenCreateChannel] = React.useState<boolean>(false);

	const navigate = useNavigate();
	const handleOpenCreateChannel = () => setOpenCreateChannel(true);
	const handleCloseCreateChannel = () => setOpenCreateChannel(false);

	const browseRooms = () => {
		navigate(`/chat/`);
	}

	const viewFriends = () => {
		navigate(`/chat/friends`);
	}

	const handleRoomMenu = () => {
		setRoomsMenu(!roomsMenu);
		if (friendMenu)
			setFriendMenu(false);
	}

	const handleFriendMenu = () => {
		setFriendMenu(!friendMenu);
		if (roomsMenu)
			setRoomsMenu(false);
	}



	return (
		<>
			<List
				sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
				component="nav"
			>
				<ListItemButton onClick={browseRooms}>
					<ListItemIcon>
						<ExploreOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary="Browse the rooms" />
				</ListItemButton>
				<ListItemButton onClick={viewFriends}>
					<ListItemIcon>
						<PeopleAltOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary="My Friends" />
				</ListItemButton>
				<ListItemButton onClick={handleOpenCreateChannel}>
					<ListItemIcon>
						<AddCircleOutlineOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary="Create Channel" />
				</ListItemButton>

				<ListItemButton onClick={handleRoomMenu}>
					<ListItemIcon>
						<StarBorder />
					</ListItemIcon>
					<ListItemText primary="My subscribed channels" />
					{roomsMenu ? <ExpandLess /> : <ExpandMore />}
				</ListItemButton>
				<Collapse in={roomsMenu} timeout="auto">

					<MyChannelsList />
				</Collapse>

				<ListItemButton onClick={handleFriendMenu}>
					<ListItemIcon>
						<PeopleAltOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary="Direct Message" />
					{friendMenu ? <ExpandLess /> : <ExpandMore />}
				</ListItemButton>
				<Collapse in={friendMenu} timeout="auto" unmountOnExit>
					<MyDirectMessageList />
				</Collapse>
			</List>
			<CreateChannelModal openCreateChannel={openCreateChannel} handleClose={handleCloseCreateChannel} />
		</>
	);
}
