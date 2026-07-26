import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateRestaurantRatingDto,
  IRestaurantRatingEntity,
} from "chopme-frontend-common";
import { createRestaurantRatingSchema } from "chopme-frontend-common";
import { Star } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

type Props = {
  initialRating?: IRestaurantRatingEntity | null;
  loading: boolean;
  onSubmit: (input: CreateRestaurantRatingDto) => void;
  onClose?: () => void;
};

const RestaurantRatingForm = ({
  initialRating,
  loading,
  onSubmit,
  onClose,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRestaurantRatingDto>({
    resolver: zodResolver(createRestaurantRatingSchema),
    defaultValues: {
      rating: initialRating?.rating ?? 0,
      comment: initialRating?.comment ?? "",
    },
  });
  const rating = watch("rating");

  useEffect(() => {
    reset({
      rating: initialRating?.rating ?? 0,
      comment: initialRating?.comment ?? "",
    });
  }, [initialRating, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-border bg-card p-4 space-y-3"
    >
      <input type="hidden" {...register("rating", { valueAsNumber: true })} />
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-text">
          {initialRating ? "Update your rating" : "Rate this restaurant"}
        </h3>
        <div className="flex items-center gap-1" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() =>
                setValue("rating", star, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              className="rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Star
                size={22}
                className={
                  star <= rating ? "fill-accent text-accent" : "text-gray-300"
                }
              />
            </button>
          ))}
        </div>
      </div>
      {errors.rating && (
        <p className="text-xs text-red-500">{errors.rating.message}</p>
      )}
      <textarea
        {...register("comment")}
        maxLength={1000}
        rows={3}
        placeholder="Share your experience"
        className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-text outline-none focus:ring-2 focus:ring-primary"
      />
      {errors.comment && (
        <p className="text-xs text-red-500">{errors.comment.message}</p>
      )}
      <div className="flex justify-end gap-3">
        {initialRating && (
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              onClose && onClose();
            }}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : initialRating
              ? "Update rating"
              : "Submit rating"}
        </button>
      </div>
    </form>
  );
};

export default RestaurantRatingForm;
