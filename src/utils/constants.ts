import { EnumRestaurantType } from "chopme-frontend-common";

export const RESTAURANT_TYPES: {
  title: string;
  type: EnumRestaurantType;
}[] = [
  {
    title: "Fast Food",
    type: EnumRestaurantType.FAST_FOOD,
  },
  {
    title: "Café",
    type: EnumRestaurantType.CAFE,
  },
];
