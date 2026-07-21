import { useEffect, useState } from "react";
import { ChevronDown, Loader2, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type ICategoryEntity,
  type Menu,
} from "chopme-frontend-common";
import { MenuService } from "../services/menu.service";
import MenuCard from "./MenuCard";
import Modal from "./Modal";
import type { RootState } from "../store";
import {
  addItemToCart,
  decrementCartItemQuantity,
  incrementCartItemQuantity,
} from "../store/cart";

type Props = {
  restaurantId: string;
  restaurantName: string;
  category: ICategoryEntity;
};

const LIMIT = 10;

const CategoryMenus = ({ restaurantId, restaurantName, category }: Props) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const { cart } = useSelector((state: RootState) => state.cart);

  // Menu waiting to be added while the cart belongs to another restaurant
  const [pendingMenu, setPendingMenu] = useState<Menu | null>(null);
  const [showCartWarning, setShowCartWarning] = useState(false);

  const getQuantityInCart = (menu: Menu): number => {
    if (!cart || cart.restaurantId !== restaurantId) return 0;
    return cart.items.find((item) => item.menuId === menu.id)?.quantity ?? 0;
  };

  const handleAdd = (menu: Menu) => {
    // Cart exists for another restaurant: warn first
    if (cart && cart.restaurantId !== restaurantId) {
      setPendingMenu(menu);
      setShowCartWarning(true);
      return;
    }

    dispatch(addItemToCart({ restaurantId, restaurantName, menuId: menu.id }));
  };

  const handleConfirmNewCart = () => {
    if (pendingMenu) {
      // addItemToCart starts a fresh cart when the restaurant changes
      dispatch(
        addItemToCart({
          restaurantId,
          restaurantName,
          menuId: pendingMenu.id,
        }),
      );
    }
    setPendingMenu(null);
    setShowCartWarning(false);
  };

  const handleIncrement = (menu: Menu) => {
    dispatch(incrementCartItemQuantity({ menuId: menu.id }));
  };

  const handleDecrement = (menu: Menu) => {
    dispatch(decrementCartItemQuantity({ menuId: menu.id }));
  };

  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true);
      try {
        const result = await MenuService.search({
          page,
          limit: LIMIT,
          restaurantId,
          categoryId: category.id,
        });

        if (
          result.data.code === EnumStatusResponse.SUCCESS &&
          result.data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
          result.data.data
        ) {
          const { items, totalPages: pages } = result.data.data;
          setMenus((prev) => (page === 1 ? items : [...prev, ...items]));
          setTotalPages(pages);
        }
      } catch (error) {
        console.error("Failed to fetch menus:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [restaurantId, category.id, page]);

  // Hide empty categories
  if (!loading && menus.length === 0) return null;

  return (
    <div>
      <div className="mb-2">
        <h3 className="font-semibold text-text">{category.name}</h3>
        {category.description && (
          <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
        )}
      </div>

      <div className="space-y-3">
        {menus.map((menu) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            quantityInCart={getQuantityInCart(menu)}
            onAdd={handleAdd}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        ))}

        {loading &&
          page === 1 &&
          [1, 2].map((i) => (
            <div
              key={i}
              className="h-[120px] bg-background rounded-2xl animate-pulse"
            />
          ))}
      </div>

      {!loading && page < totalPages && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl py-2.5 transition-colors"
        >
          View more
          <ChevronDown size={16} />
        </button>
      )}

      {loading && menus.length > 0 && (
        <div className="flex justify-center mt-3">
          <Loader2 size={18} className="text-primary animate-spin" />
        </div>
      )}

      {showCartWarning && (
        <Modal
          open={showCartWarning}
          setOpen={setShowCartWarning}
          title="Start a new cart?"
          xlSize="1"
          textButton="Start new cart"
          onValidate={handleConfirmNewCart}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">
                You already have a cart at{" "}
                <span className="text-accent">{cart?.restaurantName}</span>
              </span>
            </div>
            <p>
              You can only order from one restaurant at a time. Starting a new
              cart at{" "}
              <span className="text-accent font-medium">{restaurantName}</span>{" "}
              will remove all the items from your current cart.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CategoryMenus;
