import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { IRestaurantEntity } from "chopme-frontend-common";
import { EnumStatusCode, EnumStatusResponse } from "chopme-frontend-common";
import { RestaurantRatingService } from "../services/restaurant-rating.service";
import { KEYS } from "../utils/keys";

type Props = {
  restaurant: IRestaurantEntity;
};

const STARS = [5, 4, 3, 2, 1];

const FAKE_COUNTS: Record<number, number> = {
  5: 16,
  4: 6,
  3: 2,
  2: 0,
  1: 0,
};

const RestaurantRatingSummary = ({ restaurant }: Props) => {
  const { t } = useTranslation();
  const [starCounts, setStarCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  const average = restaurant.rating?.average ?? 0;
  const total = restaurant.rating?.total ?? 0;

  const displayAverage =
    total > Number(KEYS.MIN_RATINGS_BEFORE_SHOWING_REAL_RATINGS)
      ? average
      : Number(KEYS.FAKE_AVERAGE_RATING);
  const displayTotal =
    total > Number(KEYS.MIN_RATINGS_BEFORE_SHOWING_REAL_RATINGS)
      ? total
      : Number(KEYS.FAKE_TOTAL_NUMBER_OF_RATINGS);

  const getPercentage = (count: number) => {
    if (!displayTotal) return 0;
    return Math.round((count / displayTotal) * 100);
  };

  useEffect(() => {
    if (total < Number(KEYS.MIN_RATINGS_BEFORE_SHOWING_REAL_RATINGS)) {
      setStarCounts(FAKE_COUNTS);
      setLoading(false);
      return;
    }

    const fetchCounts = async () => {
      setLoading(true);

      try {
        const results = await Promise.all(
          STARS.map((rating) =>
            RestaurantRatingService.getRatings(restaurant.id, {
              page: 1,
              limit: 1,
              rating,
            }),
          ),
        );

        const counts: Record<number, number> = {};

        results.forEach((result, index) => {
          const star = STARS[index];

          counts[star] =
            result.data.code === EnumStatusResponse.SUCCESS &&
            result.data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
            result.data.data
              ? result.data.data.totalItems
              : 0;
        });

        setStarCounts(counts);
      } catch (error) {
        console.error("Failed to fetch rating counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [restaurant.id, total, restaurant.rating]);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Star size={18} className="text-accent fill-accent" />
        <h2 className="font-semibold text-text">{t("rating.ratings")}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center bg-background rounded-2xl p-4 min-w-[100px]">
          <span className="text-3xl font-bold text-text">
            {displayAverage.toFixed(1)}
          </span>

          <div className="flex items-center gap-1 text-accent mt-1">
            <Star size={14} className="fill-accent" />
            <span className="text-sm font-semibold">
              {displayAverage.toFixed(1)}
            </span>
          </div>

          <span className="text-xs text-gray-500 mt-1">
            {t("rating.ratingCount", { count: displayTotal })}
          </span>
        </div>

        <div className="flex-1 space-y-2">
          {loading ? (
            <div className="space-y-2">
              {STARS.map((star) => (
                <div
                  key={star}
                  className="h-2 bg-background rounded-full animate-pulse"
                />
              ))}
            </div>
          ) : (
            STARS.map((star) => {
              const count = starCounts[star] ?? 0;
              const percentage = getPercentage(count);

              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm font-semibold w-3 text-right">
                    {star}
                  </span>

                  <Star
                    size={12}
                    className="text-accent fill-accent shrink-0"
                  />

                  <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="text-xs text-gray-500 w-5 text-right">
                    {count}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantRatingSummary;
