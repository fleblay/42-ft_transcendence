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
			<ListItemButton>
				<ListItemIcon>
					<SendIcon />
				</ListItemIcon>
				<ListItemText primary="Browse the rooms" />
			</ListItemButton>

			<ListItemButton onClick={()=> setRoomsMenu(!roomsMenu)}>
				<ListItemIcon>
					<DraftsIcon />
				</ListItemIcon>
				<ListItemText primary="Rooms" />
				{roomsMenu ? <ExpandLess /> : <ExpandMore />}
			</ListItemButton>
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

			<ListItemButton onClick={()=> setFriendMenu(!friendMenu)}>
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
