import { Pencil, Star, Trash2 } from "lucide-react";
import type { IRestaurantRatingEntity } from "chopme-frontend-common";

type RatingCardProps = {
  rating: IRestaurantRatingEntity;
  isCurrentUser?: boolean;
  submitting?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

const RatingCard = ({
  rating,
  isCurrentUser = false,
  submitting = false,
  onEdit,
  onDelete,
}: RatingCardProps) => (
  <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-text">
          {isCurrentUser ? "Your rating" : rating.publicUserName}
        </p>
        <div className="mt-1 flex items-center gap-1 text-accent">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              size={15}
              className={
                index < rating.rating ? "fill-accent" : "text-gray-300"
              }
            />
          ))}
          <span className="ml-1 text-xs text-gray-500">
            {new Date(rating.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      {isCurrentUser && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onEdit}
            disabled={submitting}
            aria-label="Edit your rating"
            className="rounded-lg p-2 text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            aria-label="Delete your rating"
            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
    <p className="mt-3 text-sm leading-6 text-gray-600">{rating.comment}</p>
  </article>
);

export default RatingCard;
