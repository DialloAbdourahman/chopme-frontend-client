import type {
  IOrchestrationResult,
  IRestaurantRatingEntity,
  Pagination,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";

export const RestaurantRatingService = {
  getRatings: (
    restaurantId: string,
    {
      page,
      limit,
      rating,
    }: {
      page: number;
      limit: number;
      rating?: number;
    },
  ) => {
    const params: Record<string, number> = { page, limit };
    if (rating !== undefined) {
      params.rating = rating;
    }

    return axiosBaseClient.get<
      IOrchestrationResult<Pagination<IRestaurantRatingEntity>>
    >(`/restaurants/${restaurantId}/ratings`, { params });
  },
};
