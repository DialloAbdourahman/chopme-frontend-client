import { AxiosError, isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type CreateRestaurantRatingDto,
  type IOrchestrationResult,
  type IRestaurantEntity,
  type IRestaurantRatingEntity,
} from "chopme-frontend-common";
import type { RootState } from "../store";
import { RestaurantRatingService } from "../services/restaurant-rating.service";
import { RestaurantService } from "../services/restaurant.service";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../utils/toasts";
import DeleteModal from "./DeleteModal";
import Pagination from "./Pagination";
import RestaurantRatingForm from "./RestaurantRatingForm";
import RestaurantRatingSummary from "./RestaurantRatingSummary";
import RatingCard from "./RatingCard";
import { KEYS } from "../utils/keys";

type Props = {
  restaurant: IRestaurantEntity;
  setRestaurant?: React.Dispatch<
    React.SetStateAction<IRestaurantEntity | null>
  >;
};

const RATINGS_PER_PAGE = 10;

const FAKE_RATINGS: IRestaurantRatingEntity[] = [
  {
    id: "sample-rating-1",
    publicUserName: "Nkem A.",
    rating: 5,
    comment: "Excellent food, generous portions, and very friendly service.",
    createdAt: new Date("2025-02-18"),
    updatedAt: new Date("2025-02-18"),
  },
  {
    id: "sample-rating-2",
    publicUserName: "Kamga J.",
    rating: 5,
    comment: "Everything arrived fresh and well packaged. I will order again.",
    createdAt: new Date("2025-02-12"),
    updatedAt: new Date("2025-02-12"),
  },
  {
    id: "sample-rating-3",
    publicUserName: "Etoundi P.",
    rating: 4,
    comment:
      "Really good experience. The delivery was quick and the meal was tasty.",
    createdAt: new Date("2025-02-04"),
    updatedAt: new Date("2025-02-04"),
  },
  {
    id: "sample-rating-4",
    publicUserName: "Mbarga S.",
    rating: 5,
    comment: "The ndolé was delicious and still hot when it arrived.",
    createdAt: new Date("2025-01-28"),
    updatedAt: new Date("2025-01-28"),
  },
  {
    id: "sample-rating-5",
    publicUserName: "Fotso L.",
    rating: 5,
    comment: "Fast delivery and the portions are honest. Highly recommended.",
    createdAt: new Date("2025-01-25"),
    updatedAt: new Date("2025-01-25"),
  },
  {
    id: "sample-rating-6",
    publicUserName: "Ngo Bassa M.",
    rating: 4,
    comment: "Tasty food and good prices. Will definitely come back.",
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-01-20"),
  },
  {
    id: "sample-rating-7",
    publicUserName: "Tchoupo E.",
    rating: 5,
    comment:
      "Best eru I've had in a while. The spices were perfectly balanced.",
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "sample-rating-8",
    publicUserName: "Eyango C.",
    rating: 5,
    comment: "Ordered for the whole family, everyone loved it.",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "sample-rating-9",
    publicUserName: "Bekono F.",
    rating: 4,
    comment: "Good quality food, delivery took a bit long but worth the wait.",
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-05"),
  },
  {
    id: "sample-rating-10",
    publicUserName: "Essono V.",
    rating: 5,
    comment: "Amazing poulet DG! The plantains were perfectly cooked.",
    createdAt: new Date("2024-12-28"),
    updatedAt: new Date("2024-12-28"),
  },
  {
    id: "sample-rating-11",
    publicUserName: "Onana S.",
    rating: 5,
    comment: "Very professional service and the food was top notch.",
    createdAt: new Date("2024-12-22"),
    updatedAt: new Date("2024-12-22"),
  },
  {
    id: "sample-rating-12",
    publicUserName: "Mbida A.",
    rating: 5,
    comment: "The okok was authentic and the fried fish crispy. Bravo!",
    createdAt: new Date("2024-12-18"),
    updatedAt: new Date("2024-12-18"),
  },
  {
    id: "sample-rating-13",
    publicUserName: "Ngando T.",
    rating: 4,
    comment: "Nice portions and the restaurant staff is very welcoming.",
    createdAt: new Date("2024-12-12"),
    updatedAt: new Date("2024-12-12"),
  },
  {
    id: "sample-rating-14",
    publicUserName: "Wanko B.",
    rating: 5,
    comment: "My go-to spot now. The koki is always consistent and delicious.",
    createdAt: new Date("2024-12-05"),
    updatedAt: new Date("2024-12-05"),
  },
  {
    id: "sample-rating-15",
    publicUserName: "Ebongue N.",
    rating: 5,
    comment: "Great value for money. The soya was perfectly grilled.",
    createdAt: new Date("2024-11-28"),
    updatedAt: new Date("2024-11-28"),
  },
  {
    id: "sample-rating-16",
    publicUserName: "Takam D.",
    rating: 4,
    comment: "Pleasant surprise. Clean packaging and friendly delivery guy.",
    createdAt: new Date("2024-11-20"),
    updatedAt: new Date("2024-11-20"),
  },
  {
    id: "sample-rating-17",
    publicUserName: "Youmbi G.",
    rating: 5,
    comment: "The achu was exceptional, just like back home. Five stars!",
    createdAt: new Date("2024-11-15"),
    updatedAt: new Date("2024-11-15"),
  },
  {
    id: "sample-rating-18",
    publicUserName: "Ndoumbe H.",
    rating: 5,
    comment: "Quick service, hot food, and generous servings. Perfect.",
    createdAt: new Date("2024-11-08"),
    updatedAt: new Date("2024-11-08"),
  },
  {
    id: "sample-rating-19",
    publicUserName: "Kenfack O.",
    rating: 4,
    comment: "Really enjoyed the meal. The sauce had a great homemade taste.",
    createdAt: new Date("2024-11-01"),
    updatedAt: new Date("2024-11-01"),
  },
  {
    id: "sample-rating-20",
    publicUserName: "Ndjeng R.",
    rating: 5,
    comment:
      "Impressed by the quality. The poisson braisé was fresh and tasty.",
    createdAt: new Date("2024-10-26"),
    updatedAt: new Date("2024-10-26"),
  },
];

const pickRandomFakeRatings = () =>
  [...FAKE_RATINGS].sort(() => Math.random() - 0.5).slice(0, 5);

const RestaurantRatings = ({ restaurant, setRestaurant }: Props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.user);
  const [myRating, setMyRating] = useState<IRestaurantRatingEntity | null>(
    null,
  );
  const [ratings, setRatings] = useState<IRestaurantRatingEntity[]>([]);
  const [fakeRatings] = useState<IRestaurantRatingEntity[]>(() =>
    pickRandomFakeRatings(),
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [loadingMyRating, setLoadingMyRating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = useCallback(async () => {
    setLoadingRatings(true);
    try {
      const response = await RestaurantRatingService.getRatings(restaurant.id, {
        page,
        limit: RATINGS_PER_PAGE,
      });

      if (
        response.data.code === EnumStatusResponse.SUCCESS &&
        response.data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
        response.data.data
      ) {
        setRatings(response.data.data.items);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (fetchError) {
      console.error("Failed to fetch restaurant ratings:", fetchError);
      setError(t("rating.unableToLoadRatings"));
    } finally {
      setLoadingRatings(false);
    }
  }, [page, restaurant.id]);

  const fetchMyRating = useCallback(async () => {
    setMyRating(null);

    setLoadingMyRating(true);
    try {
      const response = await RestaurantRatingService.getMyRating(restaurant.id);
      if (
        response.data.code === EnumStatusResponse.SUCCESS &&
        response.data.data
      ) {
        setMyRating(response.data.data);
      }
    } catch (fetchError) {
      if (!isAxiosError(fetchError) || fetchError.response?.status !== 404) {
        console.error("Failed to fetch your restaurant rating:", fetchError);
        setError(t("rating.unableToLoadYourRating"));
      }
      setMyRating(null);
    } finally {
      setLoadingMyRating(false);
    }
  }, [restaurant.id]);

  const refreshRestaurantRating = async () => {
    const response = await RestaurantService.findOne(restaurant.id);
    if (
      response.data.code === EnumStatusResponse.SUCCESS &&
      response.data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
      response.data.data
    ) {
      setRestaurant?.({ ...restaurant, rating: response.data.data.rating });
    }
  };

  const showRatingError = (
    error: unknown,
    action: "create" | "update" | "delete",
  ) => {
    const requestError = error as AxiosError<IOrchestrationResult<null>>;

    switch (requestError.response?.data.statusCode) {
      case EnumStatusCode.NO_COMPLETED_ORDER_FOR_RESTAURANT:
        showWarningToast(t("rating.mustCompleteOrder"));
        break;
      case EnumStatusCode.RATING_ALREADY_EXISTS:
        showWarningToast(t("rating.alreadyRated"));
        break;
      case EnumStatusCode.RESTAURANT_NOT_FOUND:
        showWarningToast(t("rating.restaurantNotAvailable"));
        break;
      case EnumStatusCode.RATING_NOT_FOUND:
        showWarningToast(t("rating.ratingNotFound"));
        break;
      case EnumStatusCode.VALIDATION_ERROR:
        showWarningToast(t("rating.checkRatingAndComment"));
        break;
      case EnumStatusCode.NOT_ALLOWED:
        showWarningToast(t("rating.notAllowedToRate"));
        break;
      default: {
        const unableToActionKey =
          action === "create"
            ? "rating.unableToCreateRating"
            : action === "update"
              ? "rating.unableToUpdateRating"
              : "rating.unableToDeleteRating";
        showErrorToast(t(unableToActionKey));
      }
    }
  };

  const handleCreate = async (input: CreateRestaurantRatingDto) => {
    setSubmitting(true);
    try {
      const response = await RestaurantRatingService.create(
        restaurant.id,
        input,
      );
      if (
        response.data.code !== EnumStatusResponse.SUCCESS ||
        response.data.statusCode !== EnumStatusCode.CREATED_SUCCESSFULLY ||
        !response.data.data
      ) {
        showErrorToast(
          response.data.message ?? t("rating.unableToCreateRating"),
        );
        return;
      }

      setMyRating(response.data.data);
      await Promise.all([fetchRatings(), refreshRestaurantRating()]);
      showSuccessToast(t("rating.ratingCreated"));
    } catch (createError) {
      console.error("Failed to create restaurant rating:", createError);
      showRatingError(createError, "create");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (input: CreateRestaurantRatingDto) => {
    if (!myRating) return;

    setSubmitting(true);
    try {
      const response = await RestaurantRatingService.update(
        restaurant.id,
        myRating.id,
        input,
      );
      if (
        response.data.code !== EnumStatusResponse.SUCCESS ||
        response.data.statusCode !== EnumStatusCode.UPDATED_SUCCESSFULLY ||
        !response.data.data
      ) {
        showErrorToast(
          response.data.message ?? t("rating.unableToUpdateRating"),
        );
        return;
      }

      setMyRating(response.data.data);
      setEditing(false);
      await Promise.all([fetchRatings(), refreshRestaurantRating()]);
      showSuccessToast(t("rating.ratingUpdated"));
    } catch (updateError) {
      console.error("Failed to update restaurant rating:", updateError);
      showRatingError(updateError, "update");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myRating) return;

    setSubmitting(true);
    try {
      const response = await RestaurantRatingService.remove(
        restaurant.id,
        myRating.id,
      );
      if (
        response.data.code !== EnumStatusResponse.SUCCESS ||
        response.data.statusCode !== EnumStatusCode.DELETED_SUCCESSFULLY
      ) {
        showErrorToast(
          response.data.message ?? t("rating.unableToDeleteRating"),
        );
        return;
      }

      setMyRating(null);
      setEditing(false);
      setShowDeleteModal(false);
      await Promise.all([fetchRatings(), refreshRestaurantRating()]);
      showSuccessToast(t("rating.ratingDeleted"));
    } catch (deleteError) {
      console.error("Failed to delete restaurant rating:", deleteError);
      showRatingError(deleteError, "delete");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    void fetchRatings();
  }, [fetchRatings]);

  useEffect(() => {
    if (user) {
      void fetchMyRating();
    } else {
      setMyRating(null);
    }
  }, [fetchMyRating, user]);

  const displayedRatings = ratings.filter(
    (rating) => rating.id !== myRating?.id,
  );
  const signInUrl = `/signin?redirect_url=${encodeURIComponent(
    `${location.pathname}${location.search}${location.hash}`,
  )}`;

  return (
    <section className="space-y-4">
      <RestaurantRatingSummary restaurant={restaurant} />
      <DeleteModal
        open={showDeleteModal}
        setOpen={setShowDeleteModal}
        title={t("rating.deleteYourRating")}
        description={t("rating.deleteDescription")}
        loading={submitting}
        onConfirm={handleDelete}
      />

      {!user ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
          <p className="text-sm text-gray-600">{t("rating.signInToRate")}</p>
          <Link
            to={signInUrl}
            className="mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t("rating.signInToRateButton")}
          </Link>
        </div>
      ) : (
        !loadingMyRating &&
        (!myRating || editing) && (
          <RestaurantRatingForm
            initialRating={myRating}
            loading={submitting}
            onSubmit={myRating ? handleUpdate : handleCreate}
            onClose={() => setEditing(false)}
          />
        )
      )}

      {user && myRating && !editing && (
        <RatingCard
          rating={myRating}
          isCurrentUser
          submitting={submitting}
          onEdit={() => setEditing(true)}
          onDelete={() => setShowDeleteModal(true)}
        />
      )}

      <div className="bg-card rounded-2xl p-4 shadow-sm space-y-4">
        <h2 className="font-semibold text-text">
          {t("rating.customerRatings")}
        </h2>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {loadingRatings ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 rounded-xl bg-background animate-pulse"
              />
            ))}
          </div>
        ) : displayedRatings.length >=
          Number(KEYS.MIN_RATINGS_BEFORE_SHOWING_REAL_RATINGS) ? (
          <div className="space-y-3">
            {displayedRatings.map((rating) => (
              <RatingCard key={rating.id} rating={rating} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {fakeRatings.map((rating) => (
              <RatingCard key={rating.id} rating={rating} />
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
};

export default RestaurantRatings;
