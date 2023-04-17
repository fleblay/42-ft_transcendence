import axios, { AxiosHeaders } from 'axios';
import { getAccessToken, saveToken, getRefreshToken } from '../token/token';


let isResfreshing = false;
let subscribers = [] as any;

function onRefreshed(token: string | null) {
	if (!token)
		return;
	subscribers.map((cb: any) => cb(token));
  }
  
function subscribeTokenRefresh(cb : any) {
	subscribers.push(cb);
  }
  


type DecodeToken = {
	_id: string;
	email: string;
	iat: number;
	exp: number;
};

const apiClient = axios.create({});

apiClient.interceptors.request.use(
	async (config) => {
		const token = getAccessToken()
		console.log("token :", token);
		if (token) {
			const access_token = getAccessToken()
			config.headers.Authorization = `Bearer ${access_token}`;
		}
		else {
			console.log("no token");
		}
		return config;
	}
);


apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const { config, response: { status } } = error;
		const originalRequest = config;
		if (status === 498)
		{
			if (!isResfreshing) {
				isResfreshing = true;
				return new Promise((resolve, reject) => {
					axios.get('/api/auth/refresh', { headers: { 'X-Refresh-Token': getRefreshToken() } })
						.then((response) => {
							if (response.status === 200) {
								console.log("Access token refreshed");
								localStorage.removeItem('access_token');
								localStorage.removeItem('refresh_token');
								saveToken(response.data);
								originalRequest.headers.Authorization = `Bearer ${getAccessToken()}`;
								resolve(axios(originalRequest));
								onRefreshed(getAccessToken());
							}
						})
						.catch((error) => {
							console.log("Error refreshing access token", error);
							localStorage.removeItem('access_token');
							localStorage.removeItem('refresh_token');
							reject(error);
						})
						.finally(() => {
							isResfreshing = false;
						});
				});
			}

			const retryOriginalRequest = new Promise((resolve) => {
				subscribeTokenRefresh((token: string) => {
					originalRequest.headers.Authorization = `Bearer ${token}`;
					resolve(axios(originalRequest));
				});
			}
			);
			return retryOriginalRequest;

		}
		else
			return Promise.reject(error);
	}
);

  


export default apiClient;
