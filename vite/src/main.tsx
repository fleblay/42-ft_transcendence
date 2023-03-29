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
import { RegisterForm } from './pages/RegisterPage';

const router = createBrowserRouter([
	{
	  path: "/",
	  element : <App />,
	},
	{
		path: '/login',
		element: <LoginForm />
	},
	{
		path: '/register',
		element: <RegisterForm />
	},
  ]);


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
	<RouterProvider router={router} />
  </React.StrictMode>,
)
