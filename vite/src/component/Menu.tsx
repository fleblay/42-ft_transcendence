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
import { NotifcationBar } from './notifcationBar';
import { Link as LinkRouter } from "react-router-dom";

const pages = ['Game', 'Leaderboard', 'Chat'];
const menu = ['My profil', 'Friends', 'Blocked', 'Logout'];

export function MenuBar() {

	const auth = useAuthService()
	const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
	const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
	const navigate = useNavigate();
	const [imgPath, setImgPath] = React.useState<string>("/avatars/default.png");

	React.useEffect(() => {
		if (!auth.user) return;
		const userId = auth.user.id;
		console.log(userId);
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

	const handleNavigate = (page: string) => {
		page = page.toLowerCase();
		if (page === 'logout') {
			auth.logout();
		}
		else if (page === 'my profil') {
			const path = `/player/${auth.user?.id}`;
			navigate(path);
		}
		else {
			const path = page.replace(/\s/g, '');
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
								<MenuItem key={page} onClick={() => handleNavigate(page)}>
									<Typography textAlign="center">{page}</Typography>
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
						CYBER PONG
					</Typography>


					<Box
						display="flex"
						justifyContent="center"
						alignItems="center"
						sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, position: 'absolute', left: '50%', transform: 'translate(-50%, 0%)' }}>
						{pages.map((page) => (
							<Button
								key={page}
								onClick={() => handleNavigate(page)}
								sx={{ my: 4, color: 'white', display: 'block', fontWeight: 700 }}
							>
								{page}
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
								<MenuItem key={menu} onClick={() => handleNavigate(menu)}>
									<Typography textAlign="center">{menu}</Typography>
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