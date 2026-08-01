import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RootState } from "../store";
import { setOpenAddUserLocationModal } from "../store/user.slice";
import useSetupLocation from "../hooks/useSetupLocation";
import { showErrorToast, showSuccessToast } from "../utils/toasts";
import { KEYS } from "../utils/keys";

const DeliveryAddressSection = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { client, userAddressLocalStorage } = useSelector(
    (state: RootState) => state.user,
  );
  const { updateLocationFromCoordinates } = useSetupLocation();

  const location = client?.address ?? userAddressLocalStorage;

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: KEYS.GOOGLE_PLACE_API_KEY,
  });

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

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold text-text">
        {t("deliveryAddress.deliveryAddressTitle")}
      </h2>

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
        <span>
          {location
            ? t("deliveryAddress.updateAddress")
            : t("deliveryAddress.setYourLocation")}
        </span>
      </button>
    </div>
  );
};

export default DeliveryAddressSection;

{
  /* <Autocomplete
  onLoad={(autocomplete) => {
    autocompleteRef.current = autocomplete;
  }}
  onPlaceChanged={() => {
    const place = autocompleteRef.current?.getPlace();
    const location = place?.geometry?.location;
    if (!location) return;
    setPosition({ lat: location.lat(), lng: location.lng() });
  }}
>
  {" "}
  <input type="text" placeholder="Search your address..." />{" "}
</Autocomplete>; */
}
