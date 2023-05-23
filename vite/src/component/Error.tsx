import * as React from 'react';
import Button from '@mui/material/Button';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import { Alert } from '@mui/material';
import { CustomError } from '../types';
import { ErrorProviderContext } from '../ErrorProvider/ErrorProvider';



export function MyError() {
    const {error, setError} = React.useContext(ErrorProviderContext);
    const [severity, setSeverity] = React.useState<"error" | "success" | "info" | "warning">("error");
    const [message, setMessage] = React.useState<string>("");

    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        if (error) {
            setOpen(true);
            switch (error.status) {
                case 200:
                    setMessage(error.message)
                    setSeverity('info')
                    break;
                case 400:
                    setMessage(`Bad request : ${error.message}`);
                    setSeverity("error");
                    break;
                case 401:
                    setMessage("You are not logged in");
                    setSeverity("warning");
                    break;
                case 403:
                    setMessage("You are not allowed to do this");
                    setSeverity("warning");
                    break;
                case 404:
                    setMessage("This page does not exist");
                    setSeverity("warning");
                    break;
                default:
                    setMessage(`An error occured : ${error.message}`);
                    setSeverity("error");
                    break;
            }
        }

    }, [error, message]);


    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
        setError(null);

    };

    return (
        <>
        { error ? 
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical:"top", horizontal:'center' }}>
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
            : null
        }
        </>
    );
}
