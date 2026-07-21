import type { IRestaurantEntity } from "chopme-frontend-common";
import { Clock, Eye, MapPin, Star, UtensilsCrossed } from "lucide-react";
import { RESTAURANT_TYPES } from "../utils/constants";
import { ComputeUtils } from "../utils/compute-utils";

type Props = {
  restaurant: IRestaurantEntity;
};

const RestaurantHeader = ({ restaurant }: Props) => {
  const typeTitle = RESTAURANT_TYPES.find(
    (t) => t.type === restaurant.type,
  )?.title;

  const rating = 4.5;

  const isClosed = ComputeUtils.isRestaurantClosed(restaurant);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-text truncate">
            {restaurant.name}
          </h1>
          {restaurant.slogan && (
            <p className="text-sm text-primary italic mt-0.5">
              {restaurant.slogan}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
            isClosed ? "bg-gray-800 text-white" : "bg-success/10 text-success"
          }`}
        >
          {isClosed ? "Closed" : "Open"}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Star size={13} className="text-accent fill-accent" />
          <span className="font-semibold text-text">{rating}</span>
        </div>
        {typeTitle && (
          <div className="flex items-center gap-1">
            <UtensilsCrossed size={13} className="text-primary" />
            <span>{typeTitle}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Eye size={13} className="text-primary" />
          <span>{restaurant.totalViews} views</span>
        </div>
        {restaurant.distanceKm !== undefined && (
          <>
            <div className="flex items-center gap-1">
              <MapPin size={13} className="text-primary" />
              <span>{restaurant.distanceKm.toFixed(1)} km</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={13} className="text-primary" />
              <span>
                {ComputeUtils.estimateDeliveryTime(restaurant.distanceKm)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Description */}
      {restaurant.description && (
        <p className="text-sm text-gray-600 mt-3">{restaurant.description}</p>
      )}
    </div>
  );
};

export default RestaurantHeader;
