import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';

import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import Cloud from '@mui/icons-material/Cloud';

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

	return (
		<List
			sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
			component="nav"
			subheader={
				<ListSubheader component="div" id="nested-list-subheader">
					Nested List Items
				</ListSubheader>
			}
		>
			<BasicMenu />
			<ListItemButton>
				<ListItemIcon>
					<SendIcon />
				</ListItemIcon>
				<ListItemText primary="Browse the rooms" />
			</ListItemButton>

			<ListItemButton onClick={() => setRoomsMenu(!roomsMenu)}>
				<ListItemIcon>
					<DraftsIcon />
				</ListItemIcon>
				<ListItemText primary="Rooms" />
				<Button onClick={(e) => e.preventDefault()}><AddIcon /></Button>
				{roomsMenu ? <ExpandLess /> : <ExpandMore />}
			</ListItemButton>
			<Button onClick={(e) => e.preventDefault()}><AddIcon /></Button>
			<Collapse in={roomsMenu} timeout="auto" unmountOnExit>
				<List component="div" disablePadding>
					<ListItemButton sx={{ pl: 4 }}>
						<ListItemIcon>
							<StarBorder />
						</ListItemIcon>
						<ListItemText primary="Starred" />
					</ListItemButton>
				</List>
			</Collapse>

			<ListItemButton onClick={() => setFriendMenu(!friendMenu)}>
				<ListItemIcon>
					<InboxIcon />
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
	);
}
