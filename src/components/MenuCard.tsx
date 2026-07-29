import { Minus, Plus, ShoppingBag, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { IMenuEntity, IRestaurantEntity } from "chopme-frontend-common";
import { KEYS } from "../utils/keys";
import { ComputeUtils } from "../utils/compute-utils";
import { EnumCanOrderMenu } from "../enums/can-order-menu";

type Props = {
  menu: IMenuEntity;
  quantityInCart: number;
  restaurant: IRestaurantEntity;
  onAdd: (menu: IMenuEntity) => void;
  onIncrement: (menu: IMenuEntity) => void;
  onDecrement: (menu: IMenuEntity) => void;
};

const MenuCard = ({
  menu,
  quantityInCart,
  onAdd,
  onIncrement,
  onDecrement,
  restaurant,
}: Props) => {
  const navigate = useNavigate();
  const { name, description, coverImage, pictures, available } = menu;

  const imageUrl = coverImage
    ? `${KEYS.PUBLIC_S3_PREFIX}/${coverImage}`
    : pictures && pictures.length > 0
      ? `${KEYS.PUBLIC_S3_PREFIX}/${pictures[0]}`
      : null;

  const totalOrders = ComputeUtils.getMenuTotalOrders(menu.ordersCount);

  const canAddToCart = ComputeUtils.canOrderMenu({
    restaurant,
    menu,
    considerDistance: !!restaurant.distanceKm,
  });

  const handleOpenDetails = () => {
    if (!menu.restaurant?.slug) return;
    navigate(`/restaurants/${menu.restaurant.slug}/menu/${menu.id}`);
  };

  return (
    <div
      onClick={handleOpenDetails}
      className="flex gap-3 bg-background rounded-2xl p-3 hover:shadow-sm transition-shadow cursor-pointer"
    >
      {/* Image */}
      <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Utensils size={24} className="text-gray-400" />
          </div>
        )}
        {!available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-[10px] font-semibold bg-gray-800 px-2 py-0.5 rounded-full">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-text text-sm truncate">{name}</h4>
          <div className="flex items-center gap-1 shrink-0 text-[10px] font-medium text-gray-500">
            <ShoppingBag size={12} className="text-primary" />
            <span>{totalOrders} sold</span>
          </div>
        </div>

        {description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-primary text-sm">
            {menu.priceWithPlatformPercentage.toLocaleString()} FCFA
          </span>
          {quantityInCart > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDecrement(menu);
                }}
                aria-label="Decrease quantity"
                className="w-7 h-7 flex items-center justify-center bg-primary/10 text-primary rounded-lg hover:bg-primary/20 active:scale-95 transition-all"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-semibold text-text w-5 text-center">
                {quantityInCart}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onIncrement(menu);
                }}
                aria-label="Increase quantity"
                className="w-7 h-7 flex items-center justify-center bg-primary text-white rounded-lg hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              disabled={canAddToCart !== EnumCanOrderMenu.CAN_ORDER}
              onClick={(e) => {
                e.stopPropagation();
                if (canAddToCart === EnumCanOrderMenu.CAN_ORDER) {
                  onAdd(menu);
                }
              }}
              className="bg-primary text-white rounded-xl px-3 py-1.5 text-xs font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          )}
        </div>
        {canAddToCart !== EnumCanOrderMenu.CAN_ORDER && (
          <p className="text-[10px] text-red-500 mt-1 text-right leading-tight">
            {canAddToCart === EnumCanOrderMenu.RESTAURANT_CLOSED &&
              "Restaurant is currently closed."}
            {canAddToCart === EnumCanOrderMenu.MENU_NOT_AVAILABLE &&
              "This item is unavailable."}
            {canAddToCart === EnumCanOrderMenu.RESTAURANT_TOO_FAR &&
              "Delivery is not available for your location."}
            {canAddToCart === EnumCanOrderMenu.USER_DID_NOT_ADD_LOCATION &&
              "Please add a delivery location."}
          </p>
        )}
      </div>
    </div>
  );
};

export default MenuCard;
