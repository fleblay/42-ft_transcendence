import React, { useState} from "react";
import axios from "axios";
import { getAccessToken } from "../token/token";
import apiClient from "../auth/interceptor.axios";

interface FormData {
  username: string;
  email: string;
  password: string;
}

export function GetAll() {

	const [value, setValue] = useState('no data yer');

  const handleClick = () => {

	const config = {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + getAccessToken()
		}
	}
	console.log(getAccessToken())
    apiClient
      .get("/api/users/all", config)
      .then((response) => {
		return (JSON.stringify(response.data))
	  })
	  .then(stringResponse => setValue(stringResponse))
      .catch((error) => {
        console.log(error);
      });
  };




  return (
 		<div>
      		<button onClick={handleClick} >viewDatabase</button>
			<div> {value} </div>
		</div>
  );
}
