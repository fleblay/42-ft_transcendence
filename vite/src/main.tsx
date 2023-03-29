import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import {
	createBrowserRouter,
	Link,
	RouterProvider,
  } from "react-router-dom";
import { LoginForm } from './pages/LoginPage';
import { MyForm } from './pages/NameSelector';
import { GetAll } from './pages/getall';

const router = createBrowserRouter([
	{
	  path: "/",
	  element: <>
	  				<MyForm />
				<GetAll />
	  <div><Link to={'/login'}>Hello world!</Link></div>,
	  </>
	},
	{
		path: '/login',
		element: <LoginForm />
	}
  ]);


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
	<RouterProvider router={router} />
  </React.StrictMode>,
)
