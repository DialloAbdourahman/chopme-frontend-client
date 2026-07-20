import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { RestaurantService } from "../services/restaurant.service";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type FindRestaurantDto,
  type IAddressEntity,
  type IRestaurantEntity,
} from "chopme-frontend-common";
import RestaurantCard from "./RestaurantCard";
import { Link } from "react-router-dom";

type Props = {
  location: IAddressEntity | undefined;
};

const RestaurantsInHomepage = ({ location }: Props) => {
  const [restaurants, setRestaurants] = useState<IRestaurantEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [nearYou, setNearYou] = useState(false);

  const filters: FindRestaurantDto = {};
  if (location && nearYou) {
    filters.latitude = location.latitude;
    filters.longitude = location.longitude;
    filters.radiusKm = 100;
  }

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        if (location) {
          // Try to fetch restaurants near the user's location
          const locationResponse = await RestaurantService.search({
            page: 1,
            limit: 5,
            filters: {
              latitude: location.latitude,
              longitude: location.longitude,
              radiusKm: 100,
            },
          });

          if (
            locationResponse.data.code === EnumStatusResponse.SUCCESS &&
            locationResponse.data.statusCode ===
              EnumStatusCode.RECOVERED_SUCCESSFULLY &&
            locationResponse.data.data &&
            locationResponse.data.data.items.length > 0
          ) {
            // Found restaurants near the user
            setRestaurants(locationResponse.data.data.items);
            setLoading(false);
            setNearYou(true);
            return;
          }

          // No restaurants found near the user, fallback to general search
          const result = await RestaurantService.search({
            page: 1,
            limit: 5,
            filters: {},
          });
          if (
            result.data.code === EnumStatusResponse.SUCCESS &&
            result.data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
            result.data.data
          ) {
            setRestaurants(result.data.data.items);
          }
          setNearYou(false);
        } else {
          // No location, do general search
          const result = await RestaurantService.search({
            page: 1,
            limit: 5,
            filters: {},
          });

          if (
            result.data.code === EnumStatusResponse.SUCCESS &&
            result.data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
            result.data.data
          ) {
            setRestaurants(result.data.data.items);
          }
          setNearYou(false);
        }
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [location]);

  if (loading) {
    return (
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-text">
                Restaurants near you
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Tasty options close to your location
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text">
              {nearYou ? "Restaurants near you" : "Popular restaurants"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {nearYou
                ? "Tasty options close to your location"
                : "Tasty options just for you"}
            </p>
          </div>
          <Link
            to={`/restaurants?page=1&filter=${JSON.stringify(filters)}`}
            className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
          >
            See all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              location={location}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RestaurantsInHomepage;
