import { Star, Clock, MapPin } from "lucide-react";

export interface RestaurantCardProps {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  time: string;
  deliveryFee: string;
  image: string;
  isOpen: boolean;
}

const RestaurantCard = ({
  name,
  cuisine,
  rating,
  time,
  deliveryFee,
  image,
  isOpen,
}: RestaurantCardProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-40">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {!isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold bg-gray-800 px-3 py-1 rounded-full">
              Closed
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-xs font-semibold text-text">
          <Star size={12} className="text-accent fill-accent" />
          {rating}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-text">{name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{cuisine}</p>

        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={13} className="text-primary" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={13} className="text-primary" />
            <span>{deliveryFee}</span>
          </div>
        </div>

        <button className="w-full mt-4 bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all">
          Order now
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;
