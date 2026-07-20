import { useDispatch } from "react-redux";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type IOrchestrationResult,
} from "chopme-frontend-common";
import { AxiosError } from "axios";
import { useState } from "react";
import { AuthService } from "../services/auth.service";
import { ClientService } from "../services/client.service";
import {
  setClient,
  setUser,
  setUserAddressLocalStorage,
} from "../store/user.slice";
import useSetupLocation from "./useSetupLocation";

const useInitializeAfterAuth = ({
  initialLoadingState,
}: {
  initialLoadingState: boolean;
}) => {
  const [loading, setLoading] = useState(initialLoadingState);
  const dispatch = useDispatch();
  const { getLocalStorageLocation } = useSetupLocation();

  const initialize = async () => {
    if (!initialLoadingState) {
      setLoading(true);
    }

    const localLocation = getLocalStorageLocation();
    if (localLocation) {
      dispatch(setUserAddressLocalStorage(localLocation));
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
