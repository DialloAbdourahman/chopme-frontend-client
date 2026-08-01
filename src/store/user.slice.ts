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
    setUser: (state, action: PayloadAction<IUserEntity | null>) => {
      state.user = action.payload;
    },

    setClient: (state, action: PayloadAction<IClientEntity | null>) => {
      state.client = action.payload;
    },

    setUserAddressLocalStorage: (
      state,
      action: PayloadAction<IAddressEntity | null>,
    ) => {
      state.userAddressLocalStorage = action.payload;
    },

    setOpenAddUserLocationModal: (state, action: PayloadAction<boolean>) => {
      state.openAddUserLocationModal = action.payload;
    },
  },
});

export const {
  setUser,
  setClient,
  setUserAddressLocalStorage,
  setOpenAddUserLocationModal,
} = userSlice.actions;

export default userSlice.reducer;
