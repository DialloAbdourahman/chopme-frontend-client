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
  openAddUserLocationModal: boolean;
}

const initialState: UserState = {
  user: null,
  client: null,
  userAddressLocalStorage: null,
  openAddUserLocationModal: false,
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

    setOpenAddUserLocationModal: (state, action: PayloadAction<boolean>) => {
      state.openAddUserLocationModal = action.payload;
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
  setOpenAddUserLocationModal,
} = userSlice.actions;

export default userSlice.reducer;
