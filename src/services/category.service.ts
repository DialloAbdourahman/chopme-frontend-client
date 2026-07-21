import type {
  ICategoryEntity,
  IOrchestrationResult,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";

export const CategoryService = {
  findAllByRestaurant: (restaurantId: string) => {
    return axiosBaseClient.get<IOrchestrationResult<ICategoryEntity[]>>(
      `/categories/restaurant/${restaurantId}`,
    );
  },
};
