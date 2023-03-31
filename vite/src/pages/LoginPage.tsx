import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { saveToken } from "../token/token";
import TextField from '@mui/material/TextField';
import Button, { buttonClasses } from '@mui/material/Button';
import { Container } from "@mui/system";
import { Paper, Box, Typography , Grid} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom'


interface LoginData {
  email: string;
  password: string;
}


export function LoginForm(){

	let navigate = useNavigate();
  	let location = useLocation();

	let from = location.state?.from?.pathname || "/";
	const [loginData, setFormData] = useState<LoginData>({
		email: "",
		password: "",
	  });
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		axios
		  .post("/api/users/login", loginData)
		  .then((response) => {
			console.log(response);
			const user = saveToken(response.data);
			navigate(from, { replace: true });
		  })
		  .catch((error) => {
			console.log(error);
		  });
	  };
	
	const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setFormData({ ...loginData, [event.target.name]: event.target.value });
	  };
	
	  return (
		<div>
			<Container maxWidth="xs" sx={{ mb: 4 }}>
			<Paper variant="outlined" elevation={3} sx={{borderRadius: '16px', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.2)', p : 2, textAlign: "center"}}>
				<Box sx={{ my: 5 }}>
					<Typography variant="h4" align="center"> Login </Typography>
				</Box>
				<form onSubmit={handleSubmit}>

			 		 <Grid container spacing={2} alignItems="center">

							<Grid item xs={12}>
								<TextField required fullWidth label="email" type="email" name="email" onChange={handleInputChange} />
							</Grid>
							<Grid item xs={12}>
								<TextField required fullWidth label="password" type="password" name="password"  autoComplete="current-password" onChange={handleInputChange}/>
			  				</Grid>
							<Grid item xs={12}>
								<Button variant="contained" color="success" type="submit" fullWidth sx={{ my : 2}}>Submit</Button>
							</Grid>
					</Grid>
				</form>

			<Box sx={{ my : 3}}>
					<Link to="/register">No account ? Register</Link>
			</Box>
			

			</Paper>
			</Container>
		</div>
	  );
	}
	