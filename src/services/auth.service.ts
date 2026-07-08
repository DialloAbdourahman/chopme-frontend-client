import type {
  CreateClientDto,
  EmailPasswordLoginDto,
  IAuthEntity,
  IOrchestrationResult,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";

const AuthService = {
  createAccount: (dto: CreateClientDto) => {
    return axiosBaseClient.post<IOrchestrationResult<string>>("/users", dto);
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
    return axiosBaseClient.post<IOrchestrationResult<IAuthEntity>>(
      "/users/token",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },
};

export default AuthService;
