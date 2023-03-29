import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { saveToken } from "../token/token";
import { Link, redirect } from "react-router-dom";

interface LoginData {
  email: string;
  password: string;
}


export function LoginForm(){

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
			redirect("/");
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
			<form onSubmit={handleSubmit}>
			  <div>
				<label htmlFor="email">Email:</label>
				<input type="email" name="email" onChange={handleInputChange} />
			  </div>
			  <div>
				<label htmlFor="password">password:</label>
				<input type="text" name="password" onChange={handleInputChange}></input>
			  </div>
			  <button type="submit">Submit</button>
			</form>
			<Link to="/register">Register</Link>
		</div>
	  );
	}
	