import axios, { type AxiosError, type AxiosInstance } from "axios";
import { KEYS } from "../utils/keys";
import { EnumStatusCode } from "chopme-frontend-common";
import { TokensService } from "../services/tokens.service";

export const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
  });

  client.interceptors.request.use((config) => {
    const token = TokensService.getToken(KEYS.ACCESS_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        (error.response.data as any).statusCode === EnumStatusCode.TOKEN_EXPIRED
      ) {
        console.log("Token expired, refreshing...");
        originalRequest._retry = true;

        try {
          const refreshToken = TokensService.getToken(KEYS.REFRESH_TOKEN_KEY);

          const response = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
          });

          const newAccessToken = response.data.accessToken;

          TokensService.setToken({
            property: KEYS.ACCESS_TOKEN_KEY,
            value: newAccessToken,
          });

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return client(originalRequest);
        } catch {
          TokensService.removeToken(KEYS.ACCESS_TOKEN_KEY);
          TokensService.removeToken(KEYS.REFRESH_TOKEN_KEY);
          //   localStorage.removeItem("user");
          //   window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
};

export const axiosBaseClient = createApiClient(KEYS.BASE_URL);
