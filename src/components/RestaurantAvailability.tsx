import { CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  if (!availability || availability.length === 0) return null;

  const today = DAYS[new Date().getDay()];

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays size={18} className="text-primary" />
        <h2 className="font-semibold text-text">
          {t("restaurant.openingHours")}
        </h2>
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
            <span>{t(`days.${a.day.toLowerCase()}`)}</span>
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
