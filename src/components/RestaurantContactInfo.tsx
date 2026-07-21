import { Mail, MapPin, Phone } from "lucide-react";
import type { IRestaurantAddress } from "chopme-frontend-common";

type Props = {
  phone?: string;
  email?: string;
  address: IRestaurantAddress;
};

const RestaurantContactInfo = ({ phone, email, address }: Props) => {
  const fullAddress =
    address.longName ??
    [address.city, address.state, address.country].filter(Boolean).join(", ");

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <h2 className="font-semibold text-text mb-3">Contact & address</h2>
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
    </div>
  );
};

export default RestaurantContactInfo;
