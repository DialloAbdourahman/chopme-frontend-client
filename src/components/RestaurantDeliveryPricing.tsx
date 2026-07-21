import { Bike, TriangleAlert } from "lucide-react";
import type { IRestaurantDeliveryPricingKm } from "chopme-frontend-common";
import { ComputeUtils } from "../utils/compute-utils";

type Props = {
  deliveryPricingKm: IRestaurantDeliveryPricingKm[];
  distanceKm?: number;
};

const RestaurantDeliveryPricing = ({
  deliveryPricingKm,
  distanceKm,
}: Props) => {
  if (!deliveryPricingKm || deliveryPricingKm.length === 0) return null;

  const applicablePricing = ComputeUtils.getDeliveryPricing(
    deliveryPricingKm,
    distanceKm,
  );

  const cannotDeliver = distanceKm !== undefined && !applicablePricing;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Bike size={18} className="text-primary" />
        <h2 className="font-semibold text-text">Delivery pricing</h2>
      </div>

      {cannotDeliver && (
        <div className="flex items-start gap-2 bg-red-50 text-red-600 rounded-xl px-3 py-2.5 mb-3 text-sm">
          <TriangleAlert size={16} className="shrink-0 mt-0.5" />
          <span>
            Sorry, you are too far away ({distanceKm.toFixed(1)} km). This
            restaurant cannot deliver to your location.
          </span>
        </div>
      )}

      <ul className="space-y-2">
        {deliveryPricingKm.map((p) => {
          const isApplicable = p === applicablePricing;

          return (
            <li
              key={`${p.from}-${p.to}`}
              className={`flex items-center justify-between text-sm rounded-xl px-3 py-2 ${
                isApplicable
                  ? "bg-primary/10 text-primary font-semibold"
                  : "bg-background text-gray-600"
              }`}
            >
              <span className="flex items-center gap-2">
                {p.from} - {p.to} km
                {isApplicable && (
                  <span className="text-[10px] font-semibold bg-primary text-white rounded-full px-2 py-0.5">
                    Your price
                  </span>
                )}
              </span>
              <span
                className={`font-semibold ${
                  isApplicable ? "text-primary" : "text-text"
                }`}
              >
                {p.price.toLocaleString()} FCFA
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RestaurantDeliveryPricing;
