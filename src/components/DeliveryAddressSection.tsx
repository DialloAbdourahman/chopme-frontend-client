import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RootState } from "../store";
import { setOpenAddUserLocationModal } from "../store/user.slice";
import useSetupLocation from "../hooks/useSetupLocation";
import { showErrorToast, showSuccessToast } from "../utils/toasts";
import { KEYS } from "../utils/keys";

const libraries: "places"[] = ["places"];

const DeliveryAddressSection = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { userAddressLocalStorage } = useSelector(
    (state: RootState) => state.user,
  );
  const { updateLocationFromCoordinates } = useSetupLocation();

  const location = userAddressLocalStorage;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: KEYS.GOOGLE_PLACE_API_KEY,
    libraries,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const mapLocation = useMemo(
    () =>
      location ? { lat: location.latitude, lng: location.longitude } : null,
    [location?.latitude, location?.longitude],
  );

  const [markerPosition, setMarkerPosition] = useState(mapLocation);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    const newPosition = {
      lat: e.latLng?.lat() ?? markerPosition?.lat ?? 0,
      lng: e.latLng?.lng() ?? markerPosition?.lng ?? 0,
    };

    setMarkerPosition(newPosition);
  };

  const handleCancelLocation = () => {
    if (mapLocation) {
      setMarkerPosition(mapLocation);
    }
  };

  const handleConfirmLocation = async () => {
    if (!markerPosition) return;

    setIsUpdatingLocation(true);
    const updatedLocation = await updateLocationFromCoordinates(
      markerPosition.lat,
      markerPosition.lng,
    );
    setIsUpdatingLocation(false);

    if (updatedLocation) {
      showSuccessToast(t("deliveryAddress.locationUpdated"));
    } else {
      if (mapLocation) {
        setMarkerPosition(mapLocation);
      }
      showErrorToast(t("deliveryAddress.locationUpdateFailed"));
    }
  };

  const handlePlaceSelect = async (lat: number, lng: number) => {
    setIsUpdatingLocation(true);
    const updatedLocation = await updateLocationFromCoordinates(lat, lng);
    setIsUpdatingLocation(false);

    if (updatedLocation) {
      showSuccessToast(t("deliveryAddress.locationUpdated"));
      if (searchInputRef.current) {
        searchInputRef.current.value = "";
      }
    } else {
      showErrorToast(t("deliveryAddress.locationUpdateFailed"));
    }
  };

  const hasPendingPosition =
    markerPosition &&
    mapLocation &&
    (markerPosition.lat !== mapLocation.lat ||
      markerPosition.lng !== mapLocation.lng);

  useEffect(() => {
    if (mapLocation) {
      setMarkerPosition(mapLocation);
    }
  }, [mapLocation]);

  useEffect(() => {
    if (!isLoaded || !searchInputRef.current || autocompleteRef.current) {
      return;
    }

    autocompleteRef.current = new google.maps.places.Autocomplete(
      searchInputRef.current,
      { fields: ["geometry", "formatted_address"] },
    );

    const listener = autocompleteRef.current.addListener(
      "place_changed",
      () => {
        const place = autocompleteRef.current?.getPlace();
        const placeLocation = place?.geometry?.location;
        if (!placeLocation) return;
        handlePlaceSelect(placeLocation.lat(), placeLocation.lng());
      },
    );

    return () => {
      if (autocompleteRef.current && listener) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded]);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold text-text">
        {t("deliveryAddress.deliveryAddressTitle")}
      </h2>

      {isLoaded && (
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t("deliveryAddress.searchPlaceholder")}
            disabled={isUpdatingLocation}
            className="w-full rounded-xl border border-gray-200 bg-background pl-9 pr-3 py-2 text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      )}

      {location ? (
        <>
          <div className="flex items-start gap-2 text-sm text-text">
            <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
            <span>
              {location.city}, {location.country}
            </span>
          </div>

          {isLoaded && markerPosition && (
            <div className="h-48 sm:h-64 rounded-2xl overflow-hidden">
              <GoogleMap
                mapContainerStyle={{
                  width: "100%",
                  height: "100%",
                }}
                center={markerPosition}
                zoom={15}
              >
                <Marker
                  position={markerPosition}
                  onDragEnd={handleMarkerDragEnd}
                  draggable
                />
              </GoogleMap>
            </div>
          )}

          {hasPendingPosition && (
            <div className="bg-background rounded-xl p-3 space-y-2">
              <p className="text-xs text-gray-600">
                {t("deliveryAddress.confirmPrompt")}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  disabled={isUpdatingLocation}
                  className="flex-1 bg-primary text-white text-xs font-semibold rounded-xl px-3 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isUpdatingLocation
                    ? t("deliveryAddress.updating")
                    : t("deliveryAddress.setLocation")}
                </button>
                <button
                  type="button"
                  onClick={handleCancelLocation}
                  disabled={isUpdatingLocation}
                  className="flex-1 bg-gray-100 text-text text-xs font-semibold rounded-xl px-3 py-2 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">
          {t("deliveryAddress.noAddressSet")}
        </p>
      )}

      <button
        type="button"
        onClick={() => dispatch(setOpenAddUserLocationModal(true))}
        className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full text-xs font-medium text-text hover:scale-105 transition-transform"
      >
        <MapPin size={14} className="text-primary" />
        <span>{t("addUserLocation.useMyLocation")}</span>
      </button>
    </div>
  );
};

export default DeliveryAddressSection;
