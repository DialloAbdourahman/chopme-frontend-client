import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { KEYS } from "../utils/keys";
import type { ICart } from "../interfaces/cart-item";

export interface CartState {
  cart: ICart | null;
}

const initialState: CartState = {
  cart: null,
};

const persist = (cart: ICart | null) => {
  localStorage.setItem(KEYS.CART_IN_LOCAL_STORAGE, JSON.stringify(cart));
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<ICart | null>) => {
      state.cart = action.payload;
      persist(state.cart);
    },

    addItemToCart: (
      state,
      action: PayloadAction<{
        restaurantId: string;
        restaurantName: string;
        menuId: string;
      }>,
    ) => {
      const { restaurantId, restaurantName, menuId } = action.payload;

      // New cart or cart for another restaurant: start fresh
      if (!state.cart || state.cart.restaurantId !== restaurantId) {
        state.cart = {
          restaurantId,
          restaurantName,
          items: [{ menuId, quantity: 1 }],
        };
        persist(state.cart);
        return;
      }

      const existing = state.cart.items.find((item) => item.menuId === menuId);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.items.push({ menuId, quantity: 1 });
      }
      persist(state.cart);
    },

    removeItemFromCart: (state, action: PayloadAction<{ menuId: string }>) => {
      if (!state.cart) return;

      state.cart.items = state.cart.items.filter(
        (item) => item.menuId !== action.payload.menuId,
      );

      if (state.cart.items.length === 0) {
        state.cart = null;
      }
      persist(state.cart);
    },

    clearCart: (state) => {
      state.cart = null;
      persist(state.cart);
    },

    incrementCartItemQuantity: (
      state,
      action: PayloadAction<{ menuId: string }>,
    ) => {
      if (!state.cart) return;

      const item = state.cart.items.find(
        (item) => item.menuId === action.payload.menuId,
      );
      if (item) {
        item.quantity += 1;
      }
      persist(state.cart);
    },

    decrementCartItemQuantity: (
      state,
      action: PayloadAction<{ menuId: string }>,
    ) => {
      if (!state.cart) return;

      state.cart.items = state.cart.items
        .map((item) =>
          item.menuId === action.payload.menuId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0);

      if (state.cart.items.length === 0) {
        state.cart = null;
      }
      persist(state.cart);
    },
  },
});

export const {
  addItemToCart,
  removeItemFromCart,
  clearCart,
  setCart,
  incrementCartItemQuantity,
  decrementCartItemQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;
