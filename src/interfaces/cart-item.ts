export interface ICartItem {
  menuId: string;
  quantity: number;
}

export interface ICart {
  restaurantId: string;
  restaurantName: string;
  items: ICartItem[];
}
