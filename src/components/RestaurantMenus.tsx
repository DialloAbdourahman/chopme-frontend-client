import { useEffect, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type ICategoryEntity,
} from "chopme-frontend-common";
import { CategoryService } from "../services/category.service";
import CategoryMenus from "./CategoryMenus";

type Props = {
  restaurantId: string;
  restaurantName: string;
};

const RestaurantMenus = ({ restaurantId, restaurantName }: Props) => {
  const [categories, setCategories] = useState<ICategoryEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const result = await CategoryService.findAllByRestaurant(restaurantId);

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
  }, [restaurantId]);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <h2 className="font-semibold text-text mb-4">Menu</h2>

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
              restaurantId={restaurantId}
              restaurantName={restaurantName}
              category={category}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-background rounded-full p-3 mb-3">
            <UtensilsCrossed size={22} className="text-primary" />
          </div>
          <p className="text-sm text-gray-500">No menus available yet</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenus;
