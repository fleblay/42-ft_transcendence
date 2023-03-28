import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { saveToken } from "../session/session";

interface FormData {
  username: string;
  email: string;
  password: string;
}

export function MyForm() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios
      .post("/api/users/signup", formData)
      .then((response) => {
        console.log(response);
		const user = saveToken(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
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
    </form>
  );
}
