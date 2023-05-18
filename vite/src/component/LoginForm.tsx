
import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import TextField from '@mui/material/TextField';
import Button, { buttonClasses } from '@mui/material/Button';
import { Container } from "@mui/system";
import { Paper, Box, Typography, Grid, SvgIcon, Alert } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthService } from "../auth/AuthService";

export interface LoginData {
	email: string;
	password: string;
}

function Icon42() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<image xlinkHref="https://auth.42.fr/auth/resources/0nmse/login/students/img/42_logo.svg" width="24" height="24" />
	  </svg>
	);
}


export function LoginForm() {

	let navigate = useNavigate();
	let auth = useAuthService();
	const [info, setInfo] = useState<string>(auth.user ? "Already Logged in" : "")



	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const loginForm = new FormData(event.currentTarget);
		const loginData = {
			email: loginForm.get("email") as string,
			password: loginForm.get("password") as string
		};
		console.log("About to start logging process")

		auth.login(loginData).catch((error) => {
			let errorInfo = {
				status: error?.response?.status,
				statusText: error?.response?.statusText,
				message: error?.response?.data?.message
			}
			setInfo(`Login failed : ${errorInfo.status} - ${errorInfo.statusText}${" : " + (errorInfo.message || "No additional info")}`)
			console.log(error)
		});
	};

	const handle42login = () => {
			window.location.replace(`/api/auth/42externalauth`)
	}

	return (
		<div>
			<Container maxWidth="xs" sx={{ mb: 4 }}>
				<Paper variant="outlined" elevation={0} sx={{ borderRadius: '16px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.2)', p: 2, textAlign: "center" }}>
					<Box sx={{ my: 5 }}>
						<Typography variant="h4" align="center"> Login </Typography>
					</Box>
					<form onSubmit={handleSubmit}>

						<Grid container spacing={2} alignItems="center">

							<Grid item xs={12}>
								<TextField required fullWidth label="email" type="email" name="email" />
							</Grid>
							<Grid item xs={12}>
								<TextField required fullWidth label="password" type="password" name="password" autoComplete="current-password" />
							</Grid>
							<Grid item xs={12}>
								<Button variant="contained" color="primary" type="submit" fullWidth sx={{ my: 2 }}>Submit</Button>
							</Grid>
						</Grid>
					</form>
					<Grid item xs={12}>
						<Button onClick={handle42login} variant="contained"  fullWidth sx={{ my: 2, bgcolor: "#00BABC"}} startIcon={<Icon42></Icon42>}>Login with 42</Button>
					</Grid>

					<Box sx={{ my: 3 }}>
						<Link to="/register">No account ? Register</Link>
					</Box>

					{ info && <Alert severity="warning">{info}</Alert>}



				</Paper>
			</Container>
		</div>
	);
}
