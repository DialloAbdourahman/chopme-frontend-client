import type { IRestaurantEntity } from "chopme-frontend-common";
import RestaurantRatingSummary from "./RestaurantRatingSummary";

type Props = {
  restaurant: IRestaurantEntity;
  setRestaurant?: React.Dispatch<React.SetStateAction<IRestaurantEntity>>;
};

const RestaurantRatings = ({ restaurant }: Props) => {
  return (
    <div className="space-y-4">
      <RestaurantRatingSummary restaurant={restaurant} />
    </div>
  );
};

export default RestaurantRatings;
