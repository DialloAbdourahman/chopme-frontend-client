import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Clock,
  UtensilsCrossed,
} from "lucide-react";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type IMenuEntity,
  type IRestaurantEntity,
} from "chopme-frontend-common";
import Navbar from "../components/Navbar";
import RestaurantGallery from "../components/RestaurantGallery";
import { MenuService } from "../services/menu.service";
import { RestaurantService } from "../services/restaurant.service";
import { ComputeUtils } from "../utils/compute-utils";
import { EnumCanOrderMenu } from "../enums/can-order-menu";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { addItemToCart, decrementCartItemQuantity } from "../store/cart";

const MenuDetails = () => {
  const { menuId } = useParams<{ menuId: string; slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cart } = useSelector((state: RootState) => state.cart);
  const { client, userAddressLocalStorage } = useSelector(
    (state: RootState) => state.user,
  );
  const location = client?.address ?? userAddressLocalStorage;

  const [menu, setMenu] = useState<IMenuEntity | null>(null);
  const [restaurantWithLocation, setRestaurantWithLocation] =
    useState<IRestaurantEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!menuId) return;

    const fetchMenu = async () => {
      setLoading(true);
      try {
        const result = await MenuService.findOne(menuId);

        if (
          result.data.code === EnumStatusResponse.SUCCESS &&
          result.data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
          result.data.data
        ) {
          const fetchedMenu = result.data.data;
          setMenu(fetchedMenu);

          if (location && fetchedMenu.restaurant?.slug) {
            try {
              const restaurantResult = await RestaurantService.findOne(
                fetchedMenu.restaurant.slug,
                {
                  longitude: location.longitude,
                  latitude: location.latitude,
                },
              );

              if (
                restaurantResult.data.code === EnumStatusResponse.SUCCESS &&
                restaurantResult.data.statusCode ===
                  EnumStatusCode.RECOVERED_SUCCESSFULLY &&
                restaurantResult.data.data
              ) {
                setRestaurantWithLocation(restaurantResult.data.data);
              }
            } catch (error) {
              console.error("Failed to fetch restaurant with distance:", error);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [menuId, location]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (menu?.restaurant?.slug) {
      navigate(`/restaurants/${menu.restaurant.slug}`);
    } else {
      navigate("/");
    }
  };

  const canAddToCart = menu
    ? ComputeUtils.canOrderMenu({
        restaurant: restaurantWithLocation ?? menu.restaurant,
        menu,
        considerDistance: !!restaurantWithLocation,
      })
    : EnumCanOrderMenu.CAN_ORDER;

  const handleAdd = () => {
    if (!menu || canAddToCart !== EnumCanOrderMenu.CAN_ORDER) return;
    dispatch(
      addItemToCart({
        restaurantId: menu.restaurant.id,
        restaurantName: menu.restaurant.name,
        menuId: menu.id,
      }),
    );
  };

  const quantityInCart =
    cart?.items.find((item) => item.menuId === menuId)?.quantity ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 pt-4 pb-16">
          <div className="h-64 sm:h-80 bg-card rounded-2xl animate-pulse" />
          <div className="mt-4 space-y-3">
            <div className="h-6 w-2/3 bg-card rounded-xl animate-pulse" />
            <div className="h-4 w-1/2 bg-card rounded-xl animate-pulse" />
            <div className="h-24 bg-card rounded-2xl animate-pulse" />
            <div className="h-12 bg-card rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="bg-card rounded-full p-4 mb-4">
            <UtensilsCrossed size={28} className="text-primary" />
          </div>
          <h3 className="font-semibold text-text">Menu not found</h3>
          <p className="text-sm text-gray-500 mt-1">
            This item doesn't exist or is no longer available
          </p>
        </div>
      </div>
    );
  }

  const totalOrders = ComputeUtils.getMenuTotalOrders(menu.ordersCount);

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />

      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors px-4 pt-4"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Gallery */}
        <div className="px-4 mt-4">
          <RestaurantGallery
            name={menu.name}
            coverImage={menu.coverImage}
            pictures={menu.pictures}
          />
        </div>

        {/* Details */}
        <div className="px-4 mt-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-text">{menu.name}</h1>
              {menu.category && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {menu.category.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 bg-background px-2.5 py-1 rounded-lg text-sm font-semibold text-text shrink-0">
              <ShoppingBag size={14} className="text-primary" />
              {totalOrders}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-primary" />
              <span>Added {new Date(menu.createdAt).toLocaleDateString()}</span>
            </div>
            <span>{totalOrders} orders</span>
          </div>

          {menu.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {menu.description}
            </p>
          )}

          <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Price</span>
              <span className="text-lg font-bold text-primary">
                {menu.priceWithPlatformPercentage.toLocaleString()} FCFA
              </span>
            </div>
          </div>

          {/* Add to cart */}
          {quantityInCart > 0 ? (
            <div className="bg-card rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <span className="text-sm font-medium text-text">
                In your cart
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    dispatch(decrementCartItemQuantity({ menuId: menu.id }))
                  }
                  className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-lg"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-semibold text-text w-4 text-center">
                  {quantityInCart}
                </span>
                <button
                  disabled={canAddToCart !== EnumCanOrderMenu.CAN_ORDER}
                  onClick={handleAdd}
                  className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button
              disabled={canAddToCart !== EnumCanOrderMenu.CAN_ORDER}
              onClick={handleAdd}
              className="w-full bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add to cart
            </button>
          )}
          {canAddToCart !== EnumCanOrderMenu.CAN_ORDER && (
            <p className="text-xs text-red-500 text-center leading-tight">
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

          {/* Restaurant link */}
          <div className="bg-card rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
              From
            </p>
            <button
              onClick={() => navigate(`/restaurants/${menu.restaurant.slug}`)}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {menu.restaurant.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDetails;
