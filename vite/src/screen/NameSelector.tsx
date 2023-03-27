import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface FormData {
  name: string;
  email: string;
  password: string;
}

export function MyForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios
      .post("http://localhost:4243/api/signup", formData)
      .then((response) => {
        console.log(response);
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
        <label htmlFor="name">Name:</label>
        <input type="text" name="name" onChange={handleInputChange} />
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
