import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, Utensils } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type IMenuEntity,
  type IRestaurantEntity,
  type CreateOrderDto,
  type IOrchestrationResult,
} from "chopme-frontend-common";
import type { RootState } from "../store";
import type { ICartItem } from "../interfaces/cart-item";
import { MenuService } from "../services/menu.service";
import { RestaurantService } from "../services/restaurant.service";
import {
  clearCart,
  decrementCartItemQuantity,
  incrementCartItemQuantity,
  removeItemFromCart,
} from "../store/cart";
import { setClient, setOpenAddUserLocationModal } from "../store/user.slice";
import Navbar from "../components/Navbar";
import { ClientService } from "../services/client.service";
import { OrderService } from "../services/order.service";
import { ComputeUtils } from "../utils/compute-utils";
import { AxiosError } from "axios";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../utils/toasts";

type CartMenuItemProps = {
  item: ICartItem;
  menu: IMenuEntity;
  restaurant: IRestaurantEntity;
  onIncrement: (menuId: string) => void;
  onDecrement: (menuId: string) => void;
  onRemove: (menuId: string) => void;
};

const CartMenuItem = ({
  item,
  menu,
  onIncrement,
  onDecrement,
  onRemove,
}: CartMenuItemProps) => {
  const imageUrl = ComputeUtils.getMenuImageUrl(menu);

  return (
    <div className="flex gap-4 bg-card rounded-2xl p-4 shadow-sm">
      <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-200 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={menu?.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Utensils size={24} className="text-gray-400" />
          </div>
        )}
        {menu && !menu.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-[8px] font-semibold bg-gray-800 px-1.5 py-0.5 rounded-full text-center leading-tight">
              Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-text truncate">
            {menu?.name ?? "Loading..."}
          </h4>
          <button
            onClick={() => onRemove(item.menuId)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <p className="text-sm text-primary font-semibold mt-0.5">
          {menu
            ? `${(
                menu.priceWithPlatformPercentage * item.quantity
              ).toLocaleString()} FCFA`
            : "..."}
        </p>
        {menu && !menu.available && (
          <p className="text-xs text-red-600 mt-1 font-bold animate-bounce">
            No longer available
          </p>
        )}

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => onDecrement(item.menuId)}
            className="w-8 h-8 flex items-center justify-center bg-background rounded-lg text-primary hover:bg-primary/10"
          >
            <Minus size={14} />
          </button>
          <span className="text-sm font-semibold text-text w-4 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onIncrement(item.menuId)}
            className="w-8 h-8 flex items-center justify-center bg-primary rounded-lg text-white hover:opacity-90"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useSelector((state: RootState) => state.cart);
  const { client, userAddressLocalStorage, user } = useSelector(
    (state: RootState) => state.user,
  );
  const location = client?.address ?? userAddressLocalStorage;
  const isLoggedIn = !!user;

  const [menuDetails, setMenuDetails] = useState<Record<string, IMenuEntity>>(
    {},
  );
  const [restaurant, setRestaurant] = useState<IRestaurantEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantNotFound, setRestaurantNotFound] = useState(false);

  const [phoneNumberInput, setPhoneNumberInput] = useState("");
  const [isSavingPhoneNumber, setIsSavingPhoneNumber] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const totalItems =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const totalPrice = cart?.items.reduce((sum, item) => {
    const price = menuDetails[item.menuId]?.priceWithPlatformPercentage ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const hasUnavailableItem =
    cart?.items.some((item) => !menuDetails[item.menuId]?.available) ?? false;

  const needsPhoneNumber = isLoggedIn && client ? !client.phoneNumber : false;

  const isRestaurantClosed =
    restaurant && ComputeUtils.isRestaurantClosed(restaurant);
  const deliveryPricing =
    restaurant &&
    ComputeUtils.getDeliveryPricing(
      restaurant.deliveryPricingKm,
      restaurant.distanceKm,
    );

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      setMenuDetails({});
      setRestaurant(null);
      setRestaurantNotFound(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setRestaurantNotFound(false);
      setRestaurant(null);
      setMenuDetails({});

      if (!cart.restaurantId) {
        setRestaurantNotFound(true);
        setLoading(false);
        return;
      }

      let restaurantData: IRestaurantEntity | null = null;

      try {
        const restaurantResult = await RestaurantService.findOne(
          cart.restaurantId,
          location
            ? {
                longitude: location.longitude,
                latitude: location.latitude,
              }
            : undefined,
        );

        if (
          restaurantResult.data.code === EnumStatusResponse.SUCCESS &&
          restaurantResult.data.statusCode ===
            EnumStatusCode.RECOVERED_SUCCESSFULLY &&
          restaurantResult.data.data
        ) {
          restaurantData = restaurantResult.data.data;
          setRestaurant(restaurantData);
        } else {
          setRestaurantNotFound(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch restaurant:", error);
        setRestaurantNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const details: Record<string, IMenuEntity> = {};
        await Promise.all(
          cart.items.map(async (item) => {
            const result = await MenuService.findOne(item.menuId);
            if (
              result.data.code === EnumStatusResponse.SUCCESS &&
              result.data.statusCode ===
                EnumStatusCode.RECOVERED_SUCCESSFULLY &&
              result.data.data
            ) {
              details[item.menuId] = result.data.data;
            }
          }),
        );
        setMenuDetails(details);
      } catch (error) {
        console.error("Failed to fetch cart menu details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cart, location]);

  useEffect(() => {
    if (client && !client.address && userAddressLocalStorage) {
      const populateAddress = async () => {
        const { data } = await ClientService.updateMyAddress({
          longitude: userAddressLocalStorage.longitude,
          latitude: userAddressLocalStorage.latitude,
          country: userAddressLocalStorage.country,
          city: userAddressLocalStorage.city,
        });

        dispatch(setClient(data.data));
      };
      populateAddress();
    }
  }, [client, userAddressLocalStorage]);

  useEffect(() => {
    const initializeLocation = async () => {
      if (!location) {
        dispatch(setOpenAddUserLocationModal(true));
      }
    };
    initializeLocation();
  }, []);

  const handleIncrement = (menuId: string) => {
    dispatch(incrementCartItemQuantity({ menuId }));
  };

  const handleDecrement = (menuId: string) => {
    dispatch(decrementCartItemQuantity({ menuId }));
  };

  const handleRemove = (menuId: string) => {
    dispatch(removeItemFromCart({ menuId }));
  };

  const handleSavePhoneNumber = async () => {
    const phone = phoneNumberInput.trim();
    if (!phone) {
      setPhoneNumberError("Please enter a phone number.");
      return;
    }
    if (!/^6\d{8}$/.test(phone)) {
      setPhoneNumberError(
        "Phone number must be a valid number like 600000000.",
      );
      return;
    }
    setPhoneNumberError(null);
    setIsSavingPhoneNumber(true);
    try {
      const result = await ClientService.updateMyInformation({
        phoneNumber: `+237${phone}`,
      });
      if (
        result.data.code === EnumStatusResponse.SUCCESS &&
        result.data.statusCode === EnumStatusCode.UPDATED_SUCCESSFULLY &&
        result.data.data
      ) {
        dispatch(setClient(result.data.data));
        setPhoneNumberInput("");
      } else {
        setPhoneNumberError(
          result.data.message ?? "Failed to save phone number.",
        );
      }
    } catch (error) {
      setPhoneNumberError("Failed to save phone number. Please try again.");
    } finally {
      setIsSavingPhoneNumber(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart) return;

    setIsPlacingOrder(true);
    try {
      const payload: CreateOrderDto = {
        restaurantId: cart.restaurantId,
        items: cart.items.map((item) => ({
          productId: item.menuId,
          quantity: item.quantity,
        })),
      };

      const { data } = await OrderService.create(payload);
      if (
        data.code === EnumStatusResponse.SUCCESS &&
        data.statusCode === EnumStatusCode.CREATED_SUCCESSFULLY &&
        data.data
      ) {
        const orderId = data.data.id;

        try {
          const payRes = await OrderService.pay(orderId);
          if (
            payRes.data.code === EnumStatusResponse.SUCCESS &&
            payRes.data.statusCode === EnumStatusCode.PAYMENT_INITIATED &&
            payRes.data.data?.url
          ) {
            setIsRedirecting(true);
            window.location.href = payRes.data.data.url;
            dispatch(clearCart());
            return;
          }
        } catch {
          // Fall back to order details if payment URL cannot be retrieved.
        }

        showSuccessToast("Order placed successfully");
        dispatch(clearCart());
        navigate(`/orders/${orderId}`);
      } else {
        showErrorToast(data.message ?? "Could not place order.");
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      const statusCode = err.response?.data?.statusCode;

      switch (statusCode) {
        case EnumStatusCode.RESTAURANT_NOT_FOUND:
          showWarningToast("Restaurant not found.");
          break;
        case EnumStatusCode.RESTAURANT_CLOSED:
          showWarningToast("Restaurant is currently closed.");
          break;
        case EnumStatusCode.CLIENT_NOT_FOUND:
          showWarningToast("Client not found. Please sign in again.");
          break;
        case EnumStatusCode.CLIENT_INFORMATION_INCOMPLETE:
          showWarningToast("Please add your address and phone number.");
          break;
        case EnumStatusCode.TOO_FAR:
          showWarningToast("This restaurant is too far for delivery.");
          break;
        case EnumStatusCode.ONE_OF_THE_MENUS_DOES_NOT_EXIST:
          showWarningToast("One or more items were not found.");
          break;
        case EnumStatusCode.NOT_FROM_SAME_RESTAURANT:
          showWarningToast("All items must be from the same restaurant.");
          break;
        case EnumStatusCode.ONE_OF_THE_MENUS_IS_NOT_AVAILABLE:
          showWarningToast("One or more items are no longer available.");
          break;
        case EnumStatusCode.VALIDATION_ERROR:
          showWarningToast("Please check your cart and try again.");
          break;
        case EnumStatusCode.INTERNAL_SERVER_ERROR:
          showErrorToast("Something went wrong. Please try again.");
          break;
        default:
          showErrorToast(
            err.response?.data?.message ??
              "Something went wrong. Please try again.",
          );
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-text">
            Redirecting to payment...
          </p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="bg-card rounded-full p-4 mb-4">
            <ShoppingBag size={28} className="text-primary" />
          </div>
          <h3 className="font-semibold text-text">Your cart is empty</h3>
          <p className="text-sm text-gray-500 mt-1">
            Add items from a restaurant to get started
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-primary text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            Browse restaurants
          </button>
        </div>
      </div>
    );
  }

  if (restaurantNotFound) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="bg-card rounded-full p-4 mb-4">
            <ShoppingBag size={28} className="text-primary" />
          </div>
          <h3 className="font-semibold text-text">Restaurant unavailable</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            This restaurant does not exist anymore or is no longer available.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-primary text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            Browse restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-6">
        <h1 className="text-xl font-bold text-text flex items-center gap-2 mb-6">
          <ShoppingBag size={22} className="text-primary" />
          Checkout ({totalItems})
        </h1>

        {(restaurant || cart.restaurantName) && (
          <div className="bg-card rounded-2xl p-4 shadow-sm mb-4">
            {restaurant && isRestaurantClosed && (
              <p className="text-sm font-semibold text-red-500 mb-2">
                Restaurant is closed
              </p>
            )}
            {restaurant &&
              !isRestaurantClosed &&
              !deliveryPricing &&
              location && (
                <p className="text-sm font-semibold text-red-500 mb-2">
                  Restaurant is too far, cannot order from it
                </p>
              )}
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              From
            </p>
            <p className="text-sm font-semibold text-text">
              {restaurant?.name ?? cart.restaurantName}
            </p>
            {restaurant?.address && (
              <p className="text-xs text-gray-500 mt-0.5">
                {restaurant.address.city}, {restaurant.address.country}
              </p>
            )}
            {restaurant?.distanceKm !== undefined && (
              <p className="text-xs text-primary mt-1">
                {restaurant.distanceKm} km away
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <CartMenuItem
                key={item.menuId}
                item={item}
                menu={menuDetails[item.menuId]}
                restaurant={restaurant}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}

        {!loading && needsPhoneNumber && (
          <div className="mt-8 bg-card rounded-2xl p-4 shadow-sm space-y-3">
            <div>
              <p className="text-sm font-semibold text-text">
                Add your phone number
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                A phone number is required so the restaurant can contact you.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus-within:ring-2 focus-within:ring-primary">
                <span className="text-gray-500 select-none">+237</span>
                <input
                  type="tel"
                  value={phoneNumberInput}
                  onChange={(e) =>
                    setPhoneNumberInput(
                      e.target.value.replace(/\D/g, "").slice(0, 9),
                    )
                  }
                  placeholder="678552214"
                  className="flex-1 ml-1 outline-none bg-transparent"
                />
              </div>
              <button
                onClick={handleSavePhoneNumber}
                disabled={isSavingPhoneNumber || !phoneNumberInput.trim()}
                className="shrink-0 w-full sm:w-auto bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingPhoneNumber ? "Saving..." : "Save"}
              </button>
            </div>
            {phoneNumberError && (
              <p className="text-xs text-red-500">{phoneNumberError}</p>
            )}
          </div>
        )}

        {!loading && (
          <div className="mt-8 bg-card rounded-2xl p-4 shadow-sm space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-base font-medium text-text">
                  {totalPrice?.toLocaleString()} FCFA
                </span>
              </div>
              {deliveryPricing && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Delivery</span>
                  <span className="text-base font-medium text-text">
                    {deliveryPricing.priceWithPlatformPercentage.toLocaleString()}{" "}
                    FCFA
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-lg font-bold text-text">
                  {(
                    (totalPrice ?? 0) +
                    (deliveryPricing
                      ? deliveryPricing.priceWithPlatformPercentage
                      : 0)
                  ).toLocaleString()}{" "}
                  FCFA
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => dispatch(clearCart())}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-background transition-colors"
              >
                <Trash2 size={16} />
                Clear
              </button>
              {!isLoggedIn ? (
                <Link
                  to={`/signin?redirect_url=${encodeURIComponent("/checkout")}`}
                  className="flex-1 bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all text-center"
                >
                  Login to order
                </Link>
              ) : !location ? (
                <button
                  onClick={() => dispatch(setOpenAddUserLocationModal(true))}
                  className="flex-1 bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
                >
                  Add location
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    isPlacingOrder ||
                    isRestaurantClosed ||
                    !deliveryPricing ||
                    hasUnavailableItem ||
                    needsPhoneNumber
                  }
                  className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                    isPlacingOrder ||
                    isRestaurantClosed ||
                    !deliveryPricing ||
                    hasUnavailableItem ||
                    needsPhoneNumber
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-primary text-white hover:opacity-90 active:scale-95"
                  }`}
                >
                  {isPlacingOrder ? "Processing..." : "Pay order"}
                </button>
              )}
            </div>
            {!location && (
              <p className="text-xs text-red-500 text-center leading-tight">
                Please add your location
              </p>
            )}
            {isRestaurantClosed && (
              <p className="text-xs text-red-500 text-center leading-tight">
                This restaurant is currently closed.
              </p>
            )}
            {restaurant.distanceKm && !deliveryPricing && (
              <p className="text-xs text-red-500 text-center leading-tight">
                This restaurant is too far from your address for delivery.
              </p>
            )}
            {hasUnavailableItem && (
              <p className="text-xs text-red-500 text-center leading-tight">
                One or more items in your cart are no longer available.
              </p>
            )}
            {needsPhoneNumber && (
              <p className="text-xs text-red-500 text-center leading-tight">
                Please add a phone number to place your order.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
