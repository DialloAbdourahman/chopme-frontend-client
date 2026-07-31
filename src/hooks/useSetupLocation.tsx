import { useDispatch, useSelector } from "react-redux";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type IAddressEntity,
} from "chopme-frontend-common";
import { ClientService } from "../services/client.service";
import { setClient, setUserAddressLocalStorage } from "../store/user.slice";
import { geocodeService } from "../utils/geocode";
import { KEYS } from "../utils/keys";
import type { RootState } from "../store";
import { useState } from "react";

const useSetupLocation = () => {
  const dispatch = useDispatch();
  const { user, client } = useSelector((state: RootState) => state.user);

  const [loadingSetupLocation, setLoadingSetupLocation] = useState(false);

  const getCurrentLocation = (): Promise<IAddressEntity> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { longitude, latitude } = position.coords;

          try {
            const geocoded = await geocodeService.reverseGeocode(
              longitude,
              latitude,
            );

            if (!geocoded?.city || !geocoded?.country) {
              reject(new Error("Could not determine city or country"));
              return;
            }

            resolve({
              longitude,
              latitude,
              city: geocoded.city,
              country: geocoded.country,
            });
          } catch {
            reject(new Error("Failed to geocode location"));
          }
        },
        (error) => {
          reject(error);
        },
      );
    });
  };

  const getLocalStorageLocation = (): IAddressEntity | undefined => {
    const savedLocation = localStorage.getItem(
      KEYS.LOCATION_IN_LOCAL_STORAGE_KEY,
    );

    if (savedLocation) {
      try {
        return JSON.parse(savedLocation) as IAddressEntity;
      } catch {
        return undefined;
      }
    }

    return undefined;
  };

  const updateAddress = async (location: IAddressEntity) => {
    localStorage.setItem(
      KEYS.LOCATION_IN_LOCAL_STORAGE_KEY,
      JSON.stringify(location),
    );

    dispatch(setUserAddressLocalStorage(location));

    if (user && client) {
      try {
        const { data } = await ClientService.updateMyAddress({
          longitude: location.longitude,
          latitude: location.latitude,
          country: location.country,
          city: location.city,
        });

        if (
          data.code === EnumStatusResponse.SUCCESS &&
          data.statusCode === EnumStatusCode.UPDATED_SUCCESSFULLY &&
          data.data
        ) {
          dispatch(setClient(data.data));
        }
      } catch (error) {
        console.error("Failed to update client address", error);
      }
    }
  };

  const setupLocation = async (): Promise<IAddressEntity> => {
    setLoadingSetupLocation(true);
    const location = await getCurrentLocation();

    await updateAddress(location);

    setLoadingSetupLocation(false);

    return location;
  };

  const updateLocationFromCoordinates = async (
    latitude: number,
    longitude: number,
  ): Promise<IAddressEntity | null> => {
    setLoadingSetupLocation(true);

    try {
      const geocoded = await geocodeService.reverseGeocode(longitude, latitude);

      if (!geocoded?.city || !geocoded?.country) {
        setLoadingSetupLocation(false);
        return null;
      }

      const location: IAddressEntity = {
        longitude,
        latitude,
        city: geocoded.city,
        country: geocoded.country,
      };

      await updateAddress(location);

      setLoadingSetupLocation(false);

      return location;
    } catch (error) {
      console.error("Failed to update location from coordinates", error);
      setLoadingSetupLocation(false);
      return null;
    }
  };

  return {
    getLocalStorageLocation,
    setupLocation,
    updateLocationFromCoordinates,
    loadingSetupLocation,
  };
};

export default useSetupLocation;
