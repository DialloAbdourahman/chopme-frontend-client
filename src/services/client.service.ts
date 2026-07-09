import type {
  IClientEntity,
  IOrchestrationResult,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";

export const ClientService = {
  getMyProfile: () => {
    return axiosBaseClient.get<IOrchestrationResult<IClientEntity>>(
      "/clients/me",
    );
  },
};
