import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { saveToken } from "../token/token";
import { Link, redirect } from "react-router-dom";

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export function RegisterForm() {
  const [RegisterData, setFormData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios
      .post("/api/users/signup", RegisterData)
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
    setFormData({ ...RegisterData, [event.target.name]: event.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username:</label>
        <input type="text" name="username" onChange={handleInputChange} />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" name="email" onChange={handleInputChange} />
      </div>
      <div>
        <label htmlFor="password">password:</label>
        <input type="text" name="password" onChange={handleInputChange}></input>
      </div>
      <button type="submit">Submit</button>
	  <Link to="/login">Login</Link>
    </form>
  );
}
