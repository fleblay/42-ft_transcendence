import { useState, ChangeEvent, FormEvent, useEffect, useContext } from "react";
import axios from "axios";
import TextField from '@mui/material/TextField';
import Button, { buttonClasses } from '@mui/material/Button';
import { Container } from "@mui/system";
import { Paper, Box, Typography, Grid } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthService } from "../auth/AuthService";
import AuthCode from "react-auth-code-input";
import './DfaForm.css'
import { getAccessToken, getDfaToken } from "../token/token";
import { ErrorProviderContext } from "../ErrorProvider/ErrorProvider";

export interface LoginData {
    email: string;
    password: string;
}

export function DfaForm() {

    let navigate = useNavigate();
    let auth = useAuthService();
    const [info, setInfo] = useState<string>("")
    const { setError } = useContext(ErrorProviderContext)


    const [result, setResult] = useState<string>("");
    const handleOnChange = (res: string) => {
        setResult(res);
    };
    
    useEffect(() => {
        if (!getDfaToken()) {
            setError({ status: 400, message: 'Wrong dfa process. Need login before.' })
            navigate('/login', { replace: true })
        }
    }, [])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        axios.post('/api/auth/validate-dfa', { code: result })
            .then(async (response) => {
                console.log('/game')
                await auth.getUser()
                navigate("/game", { replace: true });
            }).catch((error) => {
                let errorInfo = {
                    status: error?.response?.status,
                    statusText: error?.response?.statusText,
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
                        <Typography variant="h4" align="center"> Two Factor Authentification</Typography>
                    </Box>
                    <div>{info}</div>
                    <form onSubmit={handleSubmit}>

                        <Grid container spacing={2} alignItems="center">

                            <Grid item xs={12}>
                                <AuthCode allowedCharacters='numeric' inputClassName="dfa-input" onChange={handleOnChange} />

                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color="primary" type="submit" fullWidth sx={{ my: 2 }}>Submit</Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Container>
        </div>
    );
}
