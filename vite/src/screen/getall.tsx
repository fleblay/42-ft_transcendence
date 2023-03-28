import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface FormData {
  username: string;
  email: string;
  password: string;
}

export function GetAll() {

	const [value, setValue] = useState('no data yer');

  const handleClick = () => {
    axios
      .get("/api/users/all")
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
