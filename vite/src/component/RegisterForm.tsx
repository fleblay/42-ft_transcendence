import { useState,useEffect, FormEvent } from "react";
import TextField from '@mui/material/TextField';
import Button, { buttonClasses } from '@mui/material/Button';
import { Container } from "@mui/system";
import { Paper, Box, Typography, Grid, Alert } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthService } from "../auth/AuthService";
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import * as React from 'react';


export interface RegisterData {
	username: string;
	email: string;
	password: string;
}

export function RegisterForm() {

	let navigate = useNavigate();
	let location = useLocation();
	let auth = useAuthService();
	const [info, setInfo] = useState<string>(auth.user ? "Already Logged in" : "")
	const [open, setOpen] = useState<boolean>(false);

	useEffect(() => {
		if (window.orientation !== undefined  || navigator.userAgent.indexOf('IEMobile') !== -1)
			setOpen(true);

	}, [])

	let from = location.state?.from?.pathname || "/";

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const registerForm = new FormData(event.currentTarget);
		const registerData = {
			username: registerForm.get("username") as string,
			email: registerForm.get("email") as string,
			password: registerForm.get("password") as string
		};
		await auth.register(registerData).then(() => {
			navigate("/game", { replace: true });
		}).catch((error) => {
			let errorInfo = {
				status: error?.response?.status,
				statusText:  error?.response?.statusText,
				message: error?.response?.data?.message
				}
			setInfo(`Login failed : ${errorInfo.status} - ${errorInfo.statusText}${" : " + (errorInfo.message || "No additional info")}`)
		});
	};

	const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        setOpen(false);
    };

	return (
		<div>
			<Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical:"top", horizontal:'center' }}>
                <Alert severity="warning" onClose={handleClose} sx={{ width: '100%' }}>
					this page is not optimized for mobile, please use a computer
                </Alert>
            </Snackbar>
			<Container maxWidth="xs" sx={{ mb: 4 }}>
				<Paper variant="outlined" elevation={0} sx={{ borderRadius: '16px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.2)', p: 2, textAlign: "center" }}>
					<Box sx={{ my: 5 }}>
						<Typography variant="h4" align="center"> Register </Typography>
					</Box>
					<form onSubmit={handleSubmit}>

						<Grid container spacing={2} alignItems="center">
							<Grid item xs={12}>
								<TextField required fullWidth label="username" type="username" name="username" />
							</Grid>

							<Grid item xs={12}>
								<TextField required fullWidth label="email" type="email" name="email" />
							</Grid>
							<Grid item xs={12}>
								<TextField required fullWidth label="password" type="password" name="password" autoComplete="current-password" />
							</Grid>
							<Grid item xs={12}>
								<Button fullWidth variant="contained" color="primary" type="submit" sx={{ my: 2 }}>Submit</Button>
							</Grid>
						</Grid>
					</form>
					<Box sx={{ my: 3 }}>
						<Link to="/login">Already have an account ? Login</Link>
					</Box>

					{ info && <Alert severity="warning">{info}</Alert>}

				</Paper>
			</Container>
		</div>
	);
}
