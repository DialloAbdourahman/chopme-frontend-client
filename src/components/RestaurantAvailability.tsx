import { CalendarDays } from "lucide-react";
import type { IRestaurantAvailability } from "chopme-frontend-common";

type Props = {
  availability: IRestaurantAvailability[];
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const RestaurantAvailability = ({ availability }: Props) => {
  if (!availability || availability.length === 0) return null;

  const today = DAYS[new Date().getDay()];

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays size={18} className="text-primary" />
        <h2 className="font-semibold text-text">Opening hours</h2>
      </div>
      <ul className="space-y-2">
        {availability.map((a) => (
          <li
            key={a.day}
            className={`flex items-center justify-between text-sm rounded-xl px-3 py-2 ${
              a.day === today
                ? "bg-primary/10 text-primary font-semibold"
                : "text-gray-600"
            }`}
          >
            <span>{a.day}</span>
            <span>
              {a.openTime} - {a.closeTime}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RestaurantAvailability;
