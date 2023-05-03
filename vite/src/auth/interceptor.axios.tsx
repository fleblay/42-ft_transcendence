import axios, { AxiosHeaders } from 'axios';
import { getAccessToken, getRefreshToken, delAccessToken, delRefreshToken} from '../token/token';


let isResfreshing = false;
let subscribers = [] as any;

function onRefreshed() {
	subscribers.map((cb: any) => cb());
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
					axios.get('/api/auth/refresh')
						.then((response) => {
							if (response.status === 200) {
								console.log("Access token refreshed");
								resolve(axios(originalRequest));
								onRefreshed();
							}
						})
						.catch((error) => {
							console.log("Error refreshing access token", error);
							delAccessToken()
							delRefreshToken()
							reject(error);
						})
						.finally(() => {
							isResfreshing = false;
						});
				});
			}

			const retryOriginalRequest = new Promise((resolve) => {
				subscribeTokenRefresh(() => {
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
