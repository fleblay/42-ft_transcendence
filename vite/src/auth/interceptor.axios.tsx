import axios, { AxiosHeaders } from 'axios';
import jwt_decode from "jwt-decode";
import { getAccessToken, saveToken, getRefreshToken } from '../token/token';

type DecodeToken = {
	_id: string;
	email: string;
	iat: number;
	exp: number;
};

const apiClient = axios.create({});

apiClient.interceptors.request.use(
	(config) => {

		const token = localStorage.getItem('access_token') as string;
		if (token) {
			const decode = jwt_decode(token) as DecodeToken;
			console.log("decode token");
			console.log(decode);

			if (decode.exp < Date.now() / 1000) {
				console.log("token expired");
				const token = localStorage.getItem('refresh_token') as string;
				axios.get('/api/auth/refresh', { headers: { Authorization: `Bearer ${getRefreshToken()}` }}).then((res) => {
					console.log(res);
					localStorage.removeItem('access_token');
					saveToken(res.data);
				}).catch((err) => {
					console.log(err);
				}
				);
				const access_token = getAccessToken()
				config.headers.Authorization = `Bearer ${access_token}`;
			}
			else {
				const access_token = getAccessToken()
				config.headers.Authorization = `Bearer ${access_token}`;
			}
		}
		else {
			console.log("no token");
		}

		return config
	}
);

export default apiClient;