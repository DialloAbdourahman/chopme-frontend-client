import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type Menu,
} from "chopme-frontend-common";
import type { RootState } from "../store";
import { MenuService } from "../services/menu.service";
import { KEYS } from "../utils/keys";
import {
  clearCart,
  decrementCartItemQuantity,
  incrementCartItemQuantity,
} from "../store/cart";

type Props = {
  open: boolean;
  onClose: () => void;
};

const CartDrawer = ({ open, onClose }: Props) => {
  const dispatch = useDispatch();
  const { cart } = useSelector((state: RootState) => state.cart);

  const [menuDetails, setMenuDetails] = useState<Record<string, Menu>>({});
  const [loading, setLoading] = useState(false);

  const totalItems =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const totalPrice = cart?.items.reduce((sum, item) => {
    const price = menuDetails[item.menuId]?.priceWithPlatformPercentage ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const getImageUrl = (menu: Menu | undefined) => {
    if (!menu) return null;
    const img = menu.coverImage ?? menu.pictures?.[0];
    return img ? `${KEYS.PUBLIC_S3_PREFIX}/${img}` : null;
  };

  useEffect(() => {
    if (!open || !cart || cart.items.length === 0) {
      setMenuDetails({});
      return;
    }

    const fetchMenuDetails = async () => {
      setLoading(true);
      try {
        const details: Record<string, Menu> = {};
        await Promise.all(
          cart.items.map(async (item) => {
            if (menuDetails[item.menuId]) {
              details[item.menuId] = menuDetails[item.menuId];
              return;
            }
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

    fetchMenuDetails();
  }, [open, cart]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div onClick={onClose} className="flex-1 bg-text/50 transition-opacity" />

      {/* Drawer */}
      <div className="w-full max-w-sm h-full bg-card shadow-xl flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            Your cart ({totalItems})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-text transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag size={40} className="text-primary/40 mb-3" />
              <p className="text-sm text-gray-500">Your cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">
                Add items from a restaurant to get started
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-background rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {cart.restaurantName && (
                <p className="text-sm font-medium text-primary">
                  {cart.restaurantName}
                </p>
              )}
              {cart.items.map((item) => {
                const menu = menuDetails[item.menuId];
                const imageUrl = getImageUrl(menu);

                return (
                  <div
                    key={item.menuId}
                    className="flex gap-3 bg-background rounded-xl p-3"
                  >
                    <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={menu?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-text truncate">
                        {menu?.name ?? "Loading..."}
                      </h4>
                      <p className="text-xs text-primary font-semibold mt-0.5">
                        {menu
                          ? `${(
                              menu.priceWithPlatformPercentage * item.quantity
                            ).toLocaleString()} FCFA`
                          : "..."}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            dispatch(
                              decrementCartItemQuantity({
                                menuId: item.menuId,
                              }),
                            )
                          }
                          className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-primary hover:bg-primary/10"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold text-text w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            dispatch(
                              incrementCartItemQuantity({
                                menuId: item.menuId,
                              }),
                            )
                          }
                          className="w-6 h-6 flex items-center justify-center bg-primary rounded-md text-white hover:opacity-90"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-text text-base">
                {totalPrice?.toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => dispatch(clearCart())}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-background transition-colors"
              >
                <Trash2 size={14} />
                Clear
              </button>
              <button className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all">
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
