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
		<BrowserRouter>
			<RouterProvider>
				<ThemeProvider theme={true ? themeLight : themeDark}>
					<App />
				</ThemeProvider>
			</RouterProvider>
		</BrowserRouter>
)

/*
type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

function PrivateRoute({ children, ...rest }: any) {
	const [isAuthenticated, setIsAuthenticated] = React.useState<AuthState>('loading');

	fetch('/api/auth/me')
		.then(response => setIsAuthenticated('authenticated'))
		.catch(() => setIsAuthenticated('unauthenticated'));

	function getAction(): JSX.Element {
		if (isAuthenticated === 'loading') {
			return <div>Loading...</div>;
		} else if (isAuthenticated === 'authenticated') {
			return children;
		}
		return <Redirect
			to={{
				pathname: '/login',
				state: { from: rest.location },
			}}
		/>

	}
	return getAction();
}

function App() {
	return (
		<Routes>
			<PrivateRoute exact path="/">
				<HomePage />
			</PrivateRoute>
			<PrivateRoute path="/game">
				<GamePage />
			</PrivateRoute>
			<PrivateRoute path="/stats">
				<StatsPage />
			</PrivateRoute>
			<Route path="/login">
				<LoginPage />
			</Route>
			<Redirect to="/" />
		</Routes>
	);
}
*/
