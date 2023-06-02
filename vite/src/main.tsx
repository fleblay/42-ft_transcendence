import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import {
	BrowserRouter,
	Routes,
	useLocation,
} from "react-router-dom";

import { Paper, ThemeProvider, createTheme } from '@mui/material';
import { ErrorProvider } from './ErrorProvider/ErrorProvider';

export const RouterContext = React.createContext<{ to: string, from: string }>(null!!);

const RouterProvider = ({ children }: { children: JSX.Element }) => {
	const location = useLocation()
	const [route, setRoute] = React.useState({ to: "init", from: "init" })

	React.useEffect(() => {
		setRoute({ to: location.pathname, from: route.to })
	}, [location]);

	return <RouterContext.Provider value={route}>
		{children}
	</RouterContext.Provider>
}

const themeLight = createTheme({
	palette: {
		background: {
			default: "#eff0f4",
		},
		primary: {
			main: "#3f51b5"
		},
	},
	shape: {
		borderRadius: 16
	},
	components: {
		MuiContainer: {
			styleOverrides: {
				root: {
					marginTop: 25,
					marginBottom: 25,
				}
			}
		},
	}
});

const themeDark = createTheme({
	palette: {
		background: {
			default: "#010409",
			paper: "#333333"
		},
		primary: {
			main: "#3f51b5"
		},
		text: {
			primary: "#ffffff"
		}
	}
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<BrowserRouter basename={import.meta.env.BASE_URL}>
		<RouterProvider>
			<ThemeProvider theme={true ? themeLight : themeDark}>
				<ErrorProvider>
					<App />
				</ErrorProvider>
			</ThemeProvider>
		</RouterProvider>
	</BrowserRouter>
)
