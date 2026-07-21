import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Store } from "lucide-react";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type IRestaurantEntity,
} from "chopme-frontend-common";
import Navbar from "../components/Navbar";
import RestaurantGallery from "../components/RestaurantGallery";
import RestaurantAvailability from "../components/RestaurantAvailability";
import RestaurantDeliveryPricing from "../components/RestaurantDeliveryPricing";
import RestaurantContactInfo from "../components/RestaurantContactInfo";
import { RestaurantService } from "../services/restaurant.service";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import RestaurantHeader from "../components/RestaurantHeader";
import RestaurantMenus from "../components/RestaurantMenus";

const RestaurantDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<IRestaurantEntity | null>(null);
  const [loading, setLoading] = useState(true);

  const { client, userAddressLocalStorage } = useSelector(
    (state: RootState) => state.user,
  );
  const location = client?.address ?? userAddressLocalStorage;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    if (!slug) return;

    const fetchRestaurant = async () => {
      setLoading(true);
      try {
        const result = await RestaurantService.findOne(
          slug,
          location
            ? {
                longitude: location.longitude,
                latitude: location.latitude,
              }
            : undefined,
        );

        if (
          result.data.code === EnumStatusResponse.SUCCESS &&
          result.data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
          result.data.data
        ) {
          setRestaurant(result.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch restaurant:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [slug, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto">
          <div className="h-56 sm:h-72 bg-card animate-pulse" />
          <div className="px-4 mt-4 space-y-3">
            <div className="h-6 w-2/3 bg-card rounded-xl animate-pulse" />
            <div className="h-4 w-1/2 bg-card rounded-xl animate-pulse" />
            <div className="h-32 bg-card rounded-2xl animate-pulse" />
            <div className="h-32 bg-card rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="bg-card rounded-full p-4 mb-4">
            <Store size={28} className="text-primary" />
          </div>
          <h3 className="font-semibold text-text">Restaurant not found</h3>
          <p className="text-sm text-gray-500 mt-1">
            This restaurant doesn't exist or is no longer available
          </p>
        </div>
      </div>
    );
  }

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

        {/* Gallery */}
        <RestaurantGallery
          name={restaurant.name}
          coverImage={restaurant.coverImage}
          pictures={restaurant.pictures}
        />

        <div className="px-4 mt-4 space-y-4">
          {/* Header */}
          <RestaurantHeader restaurant={restaurant} />

          {/* Contact & address */}
          <RestaurantContactInfo
            phone={restaurant.phone}
            email={restaurant.email}
            address={restaurant.address}
          />

          {/* Menus placeholder */}
          <RestaurantMenus
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
          />

          {/* Delivery pricing */}
          <RestaurantDeliveryPricing
            deliveryPricingKm={restaurant.deliveryPricingKm}
            distanceKm={restaurant.distanceKm}
          />

          {/* Opening hours */}
          <RestaurantAvailability availability={restaurant.availability} />
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
