import { EnumOrderStatus, EnumRestaurantType } from "chopme-frontend-common";

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

export const statusLabels: Record<EnumOrderStatus, string> = {
  [EnumOrderStatus.CREATED]: "Created",
  [EnumOrderStatus.PAYMENT_INITIATED]: "Payment initiated",
  [EnumOrderStatus.PAYMENT_FAILED]: "Payment failed",
  [EnumOrderStatus.PAID]: "Paid",
  [EnumOrderStatus.CANCELLED_BY_CUSTOMER]: "Cancelled by you",
  [EnumOrderStatus.CANCELLED_BY_RESTAURANT]: "Cancelled by restaurant",
  [EnumOrderStatus.PREPARING_ORDER]: "Preparing order",
  [EnumOrderStatus.IN_DELIVERY]: "In delivery",
  [EnumOrderStatus.DELIVERED]: "Delivered",
  [EnumOrderStatus.DISBURSED]: "Disbursed",
};
