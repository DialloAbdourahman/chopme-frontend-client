import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user.slice";
import cartReducer from "./cart";
import notificationReducer from "./notification.slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    notification: notificationReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
