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



export function BasicMenu() {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<div>
			<Button
				id="basic-button"
				onClick={handleClick}
			>
				Dashboard
			</Button>
			<Button
				id="basic-button"
				onClick={handleClick}
			>
				Dashboard
			</Button>
			<ProfileMenu anchorEl={anchorEl} open={open} onClose={handleClose} />
		</div>
	);
}

export const ProfileMenu: React.FC<MenuProps> = (props) => {
	return (
		<Paper sx={{ width: 320, maxWidth: '100%' }}>
			<Menu {...props}>
				<MenuItem>
					<ListItemIcon>
						<ContentCut fontSize="small" />
					</ListItemIcon>
					<ListItemText>Cut</ListItemText>
				</MenuItem>
				<MenuItem>
					<ListItemIcon>
						<ContentCopy fontSize="small" />
					</ListItemIcon>
					<ListItemText>Copy</ListItemText>
				</MenuItem>
				<MenuItem>
					<ListItemIcon>
						<ContentPaste fontSize="small" />
					</ListItemIcon>
					<ListItemText>Paste</ListItemText>
				</MenuItem>
				<Divider />
				<MenuItem>
					<ListItemIcon>
						<Cloud fontSize="small" />
					</ListItemIcon>
					<ListItemText>Web Clipboard</ListItemText>
				</MenuItem>
			</Menu>
		</Paper>
	);
}



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

	const createChannel = () => {
		console.log("createChannel");
		const channelParams = {
			name: "test" + Math.floor(Math.random() * 1000),
			private: false,
			password: "test"
		}
		apiClient.post(`/api/chat/channels/create`, channelParams).then((response) => {
			console.log("channels/create", "ok");
		}).catch((error) => {
			console.log(error);
		}
		);
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
				<ListItemButton onClick={handleOpenCreateChannel}>
					<ListItemIcon>
						<AddCircleOutlineOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary="Create Channel" />
				</ListItemButton>

				<ListItemButton onClick={() => setRoomsMenu(!roomsMenu)}>
					<ListItemIcon>
						<StarBorder />
					</ListItemIcon>
					<ListItemText primary="My channel" />
					{roomsMenu ? <ExpandLess /> : <ExpandMore />}
				</ListItemButton>
				<Collapse in={roomsMenu} timeout="auto">

					<MyChannelsList />
				</Collapse>

				<ListItemButton onClick={() => setFriendMenu(!friendMenu)}>
					<ListItemIcon>
						<PeopleAltOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary="Friends" />
					{friendMenu ? <ExpandLess /> : <ExpandMore />}
				</ListItemButton>
				<Collapse in={friendMenu} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						<ListItemButton sx={{ pl: 4 }}>
							<ListItemIcon>
								<StarBorder />
							</ListItemIcon>
							<ListItemText primary="Starred" />
						</ListItemButton>
					</List>
				</Collapse>
			</List>
			<CreateChannelModal openCreateChannel={openCreateChannel} handleClose={handleCloseCreateChannel} />
		</>
	);
}
