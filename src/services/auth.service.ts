import type {
  CreateClientDto,
  EmailPasswordLoginDto,
  IAuthEntity,
  IOrchestrationResult,
  IUserEntity,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";
import axios from "axios";

export const AuthService = {
  createAccount: (dto: CreateClientDto) => {
    return axiosBaseClient.post<IOrchestrationResult<string>>("/users", {
      ...dto,
      confirmPassword: undefined,
    });
  },

  emailPasswordLogin: (dto: EmailPasswordLoginDto) => {
    return axiosBaseClient.post<IOrchestrationResult<IAuthEntity>>(
      "/users/email-password-login",
      dto,
    );
  },

  googleLogin: (code: string) => {
    return axiosBaseClient.post<IOrchestrationResult<IAuthEntity>>(
      "/users/google-login",
      {
        code,
      },
    );
  },

  refreshToken: (token: string) => {
    return axios.post<IOrchestrationResult<IAuthEntity>>(
      "/users/token",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },

  getMyProfile: () => {
    return axiosBaseClient.get<IOrchestrationResult<IUserEntity>>("/users/me");
  },
};
