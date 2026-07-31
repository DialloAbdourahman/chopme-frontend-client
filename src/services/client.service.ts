import type {
  IClientEntity,
  IOrchestrationResult,
  UpdateAddressDto,
  UpdateClientInformationDto,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";

export const ClientService = {
  getMyProfile: () => {
    return axiosBaseClient.get<IOrchestrationResult<IClientEntity>>(
      "/clients/me",
    );
  },

  updateMyAddress: (dto: UpdateAddressDto) => {
    return axiosBaseClient.patch<IOrchestrationResult<IClientEntity>>(
      "/clients/me/location",
      dto,
    );
  },

  updateMyInformation: (dto: UpdateClientInformationDto) => {
    return axiosBaseClient.patch<IOrchestrationResult<IClientEntity>>(
      "/clients/me",
      dto,
    );
  },
};
