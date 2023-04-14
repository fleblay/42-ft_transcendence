import { Menu, MenuItem } from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip'; 0
import * as React from 'react';
import { MenuBook } from '@mui/icons-material';
import ResponsiveAppBar from './ResponsiveAppBar';
import { Grid } from '@mui/material';

const pages = ['Game', 'Leaderboard', 'Chat', 'About'];
const menu = ['My profil', 'friends', 'Logout'];

export function MuiAppBar() {

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

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


    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton size="large" edge="start" color="inherit" aria-label="logo" href="/">
                    <SportsTennisIcon />
                </IconButton>
                <Typography
                    variant="h6"
                    noWrap
                    component="a"
                    href="/"
                    sx={{
                        mr: 2,
                        display: { xs: 'none', md: 'flex' },
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
                            onClick={handleCloseNavMenu}
                            sx={{ my: 4, color: 'white', display: 'block', fontWeight: 700 }}
                        >
                            {page}
                        </Button>
                    ))}

                </Box>

                <Box  display="flex" sx={{ flexGrow: 0, flexDirection: 'row', marginLeft: 'auto'}}>

                        <IconButton sx={{ p: 0 }}>
                            <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                        </IconButton>
                <Button onClick={handleOpenUserMenu} sx={{ my: 4, color: 'white', display: 'block', fontWeight: 700 }}>
                    my profil
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
                        <MenuItem key={menu} onClick={handleCloseUserMenu}>
                            <Typography textAlign="center">{menu}</Typography>
                        </MenuItem>
                    ))}
                </Menu>
            </Box>


        </Toolbar>
        </AppBar >
    );
}