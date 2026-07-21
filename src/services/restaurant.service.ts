import type {
  FindRestaurantDto,
  IOrchestrationResult,
  IRestaurantEntity,
  Pagination,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";

export const RestaurantService = {
  search: ({
    page,
    limit,
    filters,
  }: {
    page: number;
    limit: number;
    filters: FindRestaurantDto;
  }) => {
    return axiosBaseClient.post<
      IOrchestrationResult<Pagination<IRestaurantEntity>>
    >("/restaurants/search", filters, {
      params: { page, limit },
    });
  },

  findOne: (
    idOrSlug: string,
    coordinates?: { longitude: number; latitude: number },
  ) => {
    return axiosBaseClient.get<IOrchestrationResult<IRestaurantEntity>>(
      `/restaurants/${idOrSlug}`,
      {
        params: coordinates,
      },
    );
  },
};
