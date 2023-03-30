import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import {
	BrowserRouter,
	Routes,
} from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</React.StrictMode>,
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