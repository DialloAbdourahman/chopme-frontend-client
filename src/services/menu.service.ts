import type {
  IOrchestrationResult,
  Menu,
  Pagination,
} from "chopme-frontend-common";
import { axiosBaseClient } from "../lib/axios";

export const MenuService = {
  search: ({
    page,
    limit,
    restaurantId,
    categoryId,
    search,
  }: {
    page: number;
    limit: number;
    restaurantId: string;
    categoryId?: string;
    search?: string;
  }) => {
    return axiosBaseClient.get<IOrchestrationResult<Pagination<Menu>>>(
      "/menus/search",
      {
        params: { page, limit, restaurantId, categoryId, search },
      },
    );
  },

  findOne: (id: string) => {
    return axiosBaseClient.get<IOrchestrationResult<Menu>>(`/menus/${id}`);
  },
};
