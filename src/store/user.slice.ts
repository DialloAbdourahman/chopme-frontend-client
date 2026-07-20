import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  IAddressEntity,
  IClientEntity,
  IUserEntity,
} from "chopme-frontend-common";

export interface UserState {
  user: IUserEntity | null;
  client: IClientEntity | null;
  userAddressLocalStorage: IAddressEntity | null;
}

const initialState: UserState = {
  user: null,
  client: null,
  userAddressLocalStorage: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUserEntity>) => {
      state.user = action.payload;
    },

    clearUser: (state) => {
      state.user = null;
    },

    setClient: (state, action: PayloadAction<IClientEntity>) => {
      state.client = action.payload;
    },

    clearClient: (state) => {
      state.client = null;
    },

    setUserAddressLocalStorage: (
      state,
      action: PayloadAction<IAddressEntity>,
    ) => {
      state.userAddressLocalStorage = action.payload;
    },

    clearUserAddressLocalStorage: (state) => {
      state.userAddressLocalStorage = null;
    },
  },
});

export const {
  setUser,
  clearUser,
  setClient,
  clearClient,
  setUserAddressLocalStorage,
  clearUserAddressLocalStorage,
} = userSlice.actions;

export default userSlice.reducer;
