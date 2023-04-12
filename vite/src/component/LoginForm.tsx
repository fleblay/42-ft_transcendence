import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { saveToken } from "../token/token";
import TextField from '@mui/material/TextField';
import Button, { buttonClasses } from '@mui/material/Button';
import { Container } from "@mui/system";
import { Paper, Box, Typography, Grid } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthService } from "../auth/AuthService";

export interface LoginData {
	email: string;
	password: string;
}

export function LoginForm() {

	let navigate = useNavigate();
	let location = useLocation();
	let auth = useAuthService();
	const [info, setInfo] = useState<string>(auth.user ? "Already Logged in" : "No info yet...")


	let from = location.state?.from?.pathname || "/";

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const loginForm = new FormData(event.currentTarget);
		const loginData = {
			email: loginForm.get("email") as string,
			password: loginForm.get("password") as string
		};
		console.log("About to start logging process")

		auth.login(loginData).then(() => {
			console.log('/game')
			navigate("/game", { replace: true });
		}).catch((error) => {
			let errorInfo = {
				status: error?.response?.status,
				statusText:  error?.response?.statusText,
				message: error?.response?.data?.message
				}
			setInfo(`Login failed : ${errorInfo.status} - ${errorInfo.statusText}${" : " + (errorInfo.message || "No additional info")}`)
			console.log(error)
		});
	};

	return (
		<div>
			<Container maxWidth="xs" sx={{ mb: 4 }}>
				<Paper variant="outlined" elevation={0} sx={{ borderRadius: '16px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.2)', p: 2, textAlign: "center" }}>
					<Box sx={{ my: 5 }}>
						<Typography variant="h4" align="center"> Login </Typography>
					</Box>
					<div>{info}</div>
					<form onSubmit={handleSubmit}>

						<Grid container spacing={2} alignItems="center">

							<Grid item xs={12}>
								<TextField required fullWidth label="email" type="email" name="email" />
							</Grid>
							<Grid item xs={12}>
								<TextField required fullWidth label="password" type="password" name="password" autoComplete="current-password" />
							</Grid>
							<Grid item xs={12}>
								<Button variant="contained" color="success" type="submit" fullWidth sx={{ my: 2 }}>Submit</Button>
							</Grid>
						</Grid>
					</form>

					<Box sx={{ my: 3 }}>
						<Link to="/register">No account ? Register</Link>
					</Box>


				</Paper>
			</Container>
		</div>
	);
}
