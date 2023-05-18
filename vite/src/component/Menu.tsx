import { Badge, CssBaseline, Menu, MenuItem } from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthService } from '../auth/AuthService';
import { NotifcationBar } from './notifications/notifcationsBar';
import { Link as LinkRouter } from "react-router-dom";

const pages = [
	{ label: 'Game', path: 'game' },
	{ label: 'Leaderboard', path: 'leaderboard' },
	{ label: 'Chat', path: 'chat' }
];
const menu = [
	{ label: 'My profil', path: 'myprofil' },
	{ label: 'Friends', path: 'friends' },
	{ label: 'Blocked', path: 'blocked' },
	{ label: 'Logout', path: 'logout' }
];

export function MenuBar() {

	const auth = useAuthService()
	const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
	const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
	const navigate = useNavigate();
	const [imgPath, setImgPath] = React.useState<string>("/avatars/default.png");

	React.useEffect(() => {
		if (!auth.user) return;
		const userId = auth.user.id;
		setImgPath(`/avatars/${userId}.png`);
	}, [auth.user])


	const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElNav(event.currentTarget);
	};
	const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const handleNavigate = (path: string) => {
		if (path === 'logout') {
			auth.logout();
			navigate('/login')
		}
		else if (path === 'myprofil') {
			const path = `/player/${auth.user?.id}`;
			navigate(path);
		}
		else {
			navigate("/" + path);
		}
	};
	return (
		<React.Fragment>
			<CssBaseline />
			<AppBar position="static" style={{ margin: 0 }}>
				<Toolbar style={{ margin: 0 }}>

					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
						<IconButton
							size="large"
							aria-label="account of current user"
							aria-controls="menu-appbar"
							aria-haspopup="true"
							onClick={handleOpenNavMenu}
							color="inherit"
						>
							<MenuIcon />
						</IconButton>
						<Menu
							id="menu-appbar"
							anchorEl={anchorElNav}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{
								display: { xs: 'block', md: 'none' },
							}}
						>
							{pages.map((page) => (
								<MenuItem key={page.label} onClick={() => { handleNavigate(page.path); handleCloseNavMenu(); }}>
									<Typography textAlign="center">{page.label}</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>
					<IconButton size="large" edge="start" color="inherit" aria-label="logo"
						component={LinkRouter}
						to='/game'>
						<SportsTennisIcon sx={{ display: 'flex', mr: 1 }} />
					</IconButton>
					<Typography
						variant="h5"
						noWrap
						component={LinkRouter}
						to='/game'
						sx={{
							mr: 2,
							display: 'flex',
							flexGrow: { xs: 1, md: 0 },
							fontFamily: 'monospace',
							fontWeight: 700,
							letterSpacing: '.3rem',
							color: 'inherit',
							textDecoration: 'none',
						}}
					>
						FACEPONG
					</Typography>


					<Box
						display="flex"
						justifyContent="center"
						alignItems="center"
						sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, position: 'absolute', left: '50%', transform: 'translate(-50%, 0%)' }}>
						{pages.map((page) => (
							<Button
								key={page.label}
								onClick={() => handleNavigate(page.path)}
								sx={{ my: 4, color: 'white', display: 'block', fontWeight: 700 }}
							>
								{page.label}
							</Button>
						))}

					</Box>

					<Box display="flex" sx={{ flexGrow: 0, marginLeft: 'auto' }}>
						<Button onClick={handleOpenUserMenu} sx={{ color: 'white', display: 'flex', gap: 1, fontWeight: 700 }}>
							<Avatar alt={auth.user?.username} src={imgPath} />
							{auth.user?.username}
						</Button>
						<Menu
							sx={{ mt: '45px' }}
							id="menu-appbar"
							anchorEl={anchorElUser}
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							open={Boolean(anchorElUser)}
							onClose={handleCloseUserMenu}
						>
							{menu.map((menu) => (
								<MenuItem key={menu.label} onClick={() => { handleNavigate(menu.path); handleCloseUserMenu() } }>
									<Typography textAlign="center">{menu.label}</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>
					<NotifcationBar />
				</Toolbar>
			</AppBar >
		</React.Fragment>

	);
}
