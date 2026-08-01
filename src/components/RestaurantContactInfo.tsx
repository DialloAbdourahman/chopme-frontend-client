import { Contact, Mail, MapPin, Phone } from "lucide-react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useTranslation } from "react-i18next";
import type {
  IRestaurantAddress,
  IRestaurantLocation,
} from "chopme-frontend-common";
import { KEYS } from "../utils/keys";

type Props = {
  phone?: string;
  email?: string;
  address: IRestaurantAddress;
  location?: IRestaurantLocation;
};

const RestaurantContactInfo = ({ phone, email, address, location }: Props) => {
  const { t } = useTranslation();
  const fullAddress =
    address.longName ??
    [address.city, address.state, address.country].filter(Boolean).join(", ");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: KEYS.GOOGLE_PLACE_API_KEY,
  });

  const mapLocation = location
    ? {
        lat: location.coordinates[1],
        lng: location.coordinates[0],
      }
    : null;

  const containerStyle = {
    width: "100%",
    height: "100%",
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Contact size={18} className="text-primary" />
        <h2 className="font-semibold text-text">
          {t("restaurant.contactAndAddress")}
        </h2>
      </div>
      <ul className="space-y-3">
        <li className="flex items-start gap-3 text-sm text-gray-600">
          <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
          <span>{fullAddress}</span>
        </li>
        {phone && (
          <li className="flex items-center gap-3 text-sm text-gray-600">
            <Phone size={16} className="text-primary shrink-0" />
            <a href={`tel:${phone}`} className="hover:text-primary">
              {phone}
            </a>
          </li>
        )}
        {email && (
          <li className="flex items-center gap-3 text-sm text-gray-600">
            <Mail size={16} className="text-primary shrink-0" />
            <a href={`mailto:${email}`} className="hover:text-primary">
              {email}
            </a>
          </li>
        )}
      </ul>

      {isLoaded && mapLocation && (
        <div className="mt-4 h-64 sm:h-80 rounded-2xl overflow-hidden">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapLocation}
            zoom={15}
          >
            <Marker position={mapLocation} />
          </GoogleMap>
        </div>
      )}
    </div>
  );
};

export default RestaurantContactInfo;
