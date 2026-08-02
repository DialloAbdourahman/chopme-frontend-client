import { useEffect, useState } from "react";
import { UtensilsCrossed, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type ICategoryEntity,
  type IRestaurantEntity,
} from "chopme-frontend-common";
import { CategoryService } from "../services/category.service";
import CategoryMenus from "./CategoryMenus";
import type { RootState } from "../store";

type Props = {
  restaurant: IRestaurantEntity;
};

const RestaurantMenus = ({ restaurant }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart } = useSelector((state: RootState) => state.cart);
  const [categories, setCategories] = useState<ICategoryEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const hasCartForThisRestaurant = cart?.restaurantId === restaurant.id;

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const result = await CategoryService.findAllByRestaurant(restaurant.id);

        if (
          result.data.code === EnumStatusResponse.SUCCESS &&
          result.data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
          result.data.data
        ) {
          setCategories(result.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [restaurant.id]);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <UtensilsCrossed size={18} className="text-primary" />
        <h2 className="font-semibold text-text">{t("restaurant.menu")}</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[120px] bg-background rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="space-y-6">
          {categories.map((category) => (
            <CategoryMenus
              key={category.id}
              restaurant={restaurant}
              category={category}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-background rounded-full p-3 mb-3">
            <UtensilsCrossed size={22} className="text-primary" />
          </div>
          <p className="text-sm text-gray-500">{t("restaurant.noMenusYet")}</p>
        </div>
      )}

      {hasCartForThisRestaurant && (
        <button
          onClick={() => navigate("/checkout")}
          className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-primary text-white rounded-full shadow-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 animate-bounce"
        >
          <ShoppingBag size={18} />
          {t("cartDrawer.checkout")}
        </button>
      )}
    </div>
  );
};

export default RestaurantMenus;
