import { useDispatch, useSelector } from "react-redux";
import { KEYS } from "../utils/keys";
import { setOpenAddUserLocationModal } from "../store/user.slice";
import type { RootState } from "../store";

const usePromptLocation = () => {
  const { client, userAddressLocalStorage } = useSelector(
    (state: RootState) => state.user,
  );
  const dispatch = useDispatch();

  const location = client?.address ?? userAddressLocalStorage;

  const promptLocation = () => {
    const numberOfTimes = Number(
      localStorage.getItem(KEYS.MAX_LOCATION_PROMPTS_IN_LOCAL_STORAGE) ?? "0",
    );

    const maxLocationPrompts = Number(KEYS.MAX_LOCATION_PROMPTS);

    if (!location && numberOfTimes < maxLocationPrompts) {
      dispatch(setOpenAddUserLocationModal(true));

      localStorage.setItem(
        KEYS.MAX_LOCATION_PROMPTS_IN_LOCAL_STORAGE,
        String(numberOfTimes + 1),
      );
    }
  };

  return { promptLocation };
};

export default usePromptLocation;
