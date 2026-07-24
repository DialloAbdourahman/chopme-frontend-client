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
  type IMenu,
} from "chopme-frontend-common";
import Navbar from "../components/Navbar";
import { MenuService } from "../services/menu.service";
import { KEYS } from "../utils/keys";
import { ComputeUtils } from "../utils/compute-utils";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { addItemToCart, decrementCartItemQuantity } from "../store/cart";

const MenuDetails = () => {
  const { menuId } = useParams<{ menuId: string; slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cart } = useSelector((state: RootState) => state.cart);

  const [menu, setMenu] = useState<IMenu | null>(null);
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
          setMenu(result.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [menuId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (menu?.restaurant?.slug) {
      navigate(`/restaurants/${menu.restaurant.slug}`);
    } else {
      navigate("/");
    }
  };

  const handleAdd = () => {
    if (!menu) return;
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
  const allImages = [menu.coverImage, ...(menu.pictures ?? [])].filter(
    Boolean,
  ) as string[];
  const [coverImage, ...otherImages] = allImages;

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

        {/* Cover image */}
        <div className="px-4 mt-4">
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-gray-200">
            {coverImage ? (
              <img
                src={`${KEYS.PUBLIC_S3_PREFIX}/${coverImage}`}
                alt={menu.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
            {!menu.available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-sm font-semibold bg-gray-800 px-4 py-1 rounded-full">
                  Currently unavailable
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {otherImages.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {otherImages.map((img, index) => (
                <div
                  key={index}
                  className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-200"
                >
                  <img
                    src={`${KEYS.PUBLIC_S3_PREFIX}/${img}`}
                    alt={`${menu.name} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
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
                  onClick={handleAdd}
                  className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button
              disabled={!menu.available}
              onClick={handleAdd}
              className="w-full bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add to cart
            </button>
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
