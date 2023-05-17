
import { Box, Typography } from "@mui/material";

export function NotFound() {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', margin: theme => `${theme.spacing(8)} 0`  }}>
			<Typography paddingBottom={2} color='primary' variant="h3">404</Typography>
	
		</Box>
	)
}
