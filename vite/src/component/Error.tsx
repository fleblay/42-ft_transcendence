import * as React from 'react';
import Button from '@mui/material/Button';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import { Alert } from '@mui/material';
import { Error } from '../types';
import { ErrorProviderContext } from '../ErrorProvider/ErrorProvider';



export function MyError() {
    const {error, setError} = React.useContext(ErrorProviderContext);
    const [severity, setSeverity] = React.useState<"error" | "success" | "info" | "warning">("error");

    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        if (error) {
            setOpen(true);
            if (error.code === 401) {
                setSeverity("warning");
            } else {
                setSeverity("error");
            }
        }
    }, [error]);


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
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical:"bottom", horizontal:'center' }}>
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                    {error?.message}
                </Alert>
            </Snackbar>
            : null
        }
        </>
    );
}