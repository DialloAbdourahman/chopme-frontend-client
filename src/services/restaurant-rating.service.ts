import type {
  IOrchestrationResult,
  IRestaurantRatingEntity,
  Pagination,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";

type RestaurantRatingInput = {
  rating: number;
  comment: string;
};

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

  getMyRating: (restaurantId: string) =>
    axiosBaseClient.get<IOrchestrationResult<IRestaurantRatingEntity>>(
      `/restaurants/${restaurantId}/ratings/my-rating`,
    ),

  create: (restaurantId: string, input: RestaurantRatingInput) =>
    axiosBaseClient.post<IOrchestrationResult<IRestaurantRatingEntity>>(
      `/restaurants/${restaurantId}/ratings`,
      input,
    ),

  update: (
    restaurantId: string,
    ratingId: string,
    input: RestaurantRatingInput,
  ) =>
    axiosBaseClient.patch<IOrchestrationResult<IRestaurantRatingEntity>>(
      `/restaurants/${restaurantId}/ratings/${ratingId}`,
      input,
    ),

  remove: (restaurantId: string, ratingId: string) =>
    axiosBaseClient.delete<IOrchestrationResult<null>>(
      `/restaurants/${restaurantId}/ratings/${ratingId}`,
    ),
};
