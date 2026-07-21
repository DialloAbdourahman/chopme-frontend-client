import { Minus, Plus, Star } from "lucide-react";
import type { Menu } from "chopme-frontend-common";
import { KEYS } from "../utils/keys";

type Props = {
  menu: Menu;
  quantityInCart: number;
  onAdd: (menu: Menu) => void;
  onIncrement: (menu: Menu) => void;
  onDecrement: (menu: Menu) => void;
};

const MenuCard = ({
  menu,
  quantityInCart,
  onAdd,
  onIncrement,
  onDecrement,
}: Props) => {
  const { name, description, coverImage, pictures, available } = menu;

  const imageUrl = coverImage
    ? `${KEYS.PUBLIC_S3_PREFIX}/${coverImage}`
    : pictures && pictures.length > 0
      ? `${KEYS.PUBLIC_S3_PREFIX}/${pictures[0]}`
      : null;

  const rating = 4.5;

  return (
    <div className="flex gap-3 bg-background rounded-2xl p-3 hover:shadow-sm transition-shadow">
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
            <span className="text-gray-400 text-[10px] text-center px-1">
              No image
            </span>
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
          <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-text">
            <Star size={12} className="text-accent fill-accent" />
            {rating}
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
                onClick={() => onDecrement(menu)}
                aria-label="Decrease quantity"
                className="w-7 h-7 flex items-center justify-center bg-primary/10 text-primary rounded-lg hover:bg-primary/20 active:scale-95 transition-all"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-semibold text-text w-5 text-center">
                {quantityInCart}
              </span>
              <button
                onClick={() => onIncrement(menu)}
                aria-label="Increase quantity"
                className="w-7 h-7 flex items-center justify-center bg-primary text-white rounded-lg hover:opacity-90 active:scale-95 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              disabled={!available}
              onClick={() => onAdd(menu)}
              className="bg-primary text-white rounded-xl px-3 py-1.5 text-xs font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
