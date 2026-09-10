import { useDispatch } from "react-redux";
import {
  EnumStatusCode,
  EnumStatusResponse,
  mapI18nToUserLanguage,
  type IOrchestrationResult,
} from "chopme-frontend-common";
import { AxiosError } from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthService } from "../services/auth.service";
import { ClientService } from "../services/client.service";
import {
  setClient,
  setUser,
  setUserAddressLocalStorage,
} from "../store/user.slice";
import useSetupLocation from "./useSetupLocation";
import { KEYS } from "../utils/keys";
import { setCart } from "../store/cart";
import type { ICart } from "../interfaces/cart-item";
import { FirebaseService } from "../services/firebase.service";

const useInitializeAfterAuth = ({
  initialLoadingState,
}: {
  initialLoadingState: boolean;
}) => {
  const [loading, setLoading] = useState(initialLoadingState);
  const dispatch = useDispatch();
  const { getLocalStorageLocation } = useSetupLocation();
  const { i18n } = useTranslation();

  const initialize = async () => {
    if (!initialLoadingState) {
      setLoading(true);
    }

    // Get the local storage location.
    const locationInLocalStorage = getLocalStorageLocation();
    if (locationInLocalStorage) {
      dispatch(setUserAddressLocalStorage(locationInLocalStorage));
    }

    // Get cart in local storage
    const cartInLocalStorage = JSON.parse(
      localStorage.getItem(KEYS.CART_IN_LOCAL_STORAGE) ?? "null",
    );
    if (cartInLocalStorage) {
      dispatch(setCart(cartInLocalStorage as ICart));
    }

    try {
      const [userResponse, clientResponse] = await Promise.all([
        AuthService.getMyProfile(),
        ClientService.getMyProfile(),
      ]);

      const userData = userResponse.data;
      if (
        userData.code === EnumStatusResponse.SUCCESS &&
        userData.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
        userData.data
      ) {
        dispatch(setUser(userData.data));

        const browserLanguage = mapI18nToUserLanguage(i18n.language);
        if (userData.data.language !== browserLanguage) {
          try {
            const { data } = await AuthService.updateMyProfile({
              language: browserLanguage,
            });
            if (data?.data) {
              dispatch(setUser(data.data));
            }
          } catch {
            // Silently ignore language sync failures
          }
        }

        FirebaseService.registerForPushNotifications();
      }

      const clientData = clientResponse.data;
      if (
        clientData.code === EnumStatusResponse.SUCCESS &&
        clientData.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
        clientData.data
      ) {
        dispatch(setClient(clientData.data));
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      const statusCode = err.response?.data?.statusCode;
      console.log("statusCode", statusCode);
    } finally {
      setLoading(false);
    }
  };

  return { loading, initialize };
};

export default useInitializeAfterAuth;
