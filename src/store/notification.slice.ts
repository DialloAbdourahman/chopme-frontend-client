import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface NotificationState {
  newOrder: { id: string } | null;
  orderUpdate: { id: string } | null;
}

const initialState: NotificationState = {
  newOrder: null,
  orderUpdate: null,
};

export const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNewOrder: (state, action: PayloadAction<{ id: string }>) => {
      state.newOrder = action.payload;
    },

    setOrderUpdate: (state, action: PayloadAction<{ id: string }>) => {
      state.orderUpdate = action.payload;
    },
  },
});

export const { setNewOrder, setOrderUpdate } = notificationSlice.actions;

export default notificationSlice.reducer;
