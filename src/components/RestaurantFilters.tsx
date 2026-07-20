import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import type {
  EnumRestaurantType,
  FindRestaurantDto,
  IAddressEntity,
} from "chopme-frontend-common";
import { RESTAURANT_TYPES } from "../utils/constants";

type Props = {
  filters: FindRestaurantDto;
  location?: IAddressEntity;
  onApply: (filters: FindRestaurantDto) => void;
  onClear: () => void;
};

const RestaurantFilters = ({ filters, location, onApply, onClear }: Props) => {
  const [showFilters, setShowFilters] = useState(false);
  const [cityDraft, setCityDraft] = useState(filters?.city ?? "");
  const [typeDraft, setTypeDraft] = useState<EnumRestaurantType | undefined>(
    filters?.type,
  );
  const [radiusDraft, setRadiusDraft] = useState<string>(
    filters?.radiusKm ? String(filters.radiusKm) : "",
  );

  const activeFiltersCount = [
    filters?.city,
    filters?.type,
    filters?.radiusKm,
  ].filter(Boolean).length;

  const handleApply = () => {
    const city = cityDraft.trim();
    const radiusKm = Number(radiusDraft) || undefined;

    onApply({
      ...filters,
      city: city || undefined,
      type: typeDraft,
      radiusKm,
      // Radius filtering needs coordinates
      latitude: radiusKm && location ? location.latitude : undefined,
      longitude: radiusKm && location ? location.longitude : undefined,
    });
    setShowFilters(false);
  };

  const handleClear = () => {
    setCityDraft("");
    setTypeDraft(undefined);
    setRadiusDraft("");
    onClear();
    setShowFilters(false);
  };

  return (
    <>
      {/* Filters toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 bg-card rounded-xl px-4 py-2 text-sm font-medium text-text shadow-sm hover:shadow-md transition-shadow"
        >
          <SlidersHorizontal size={16} className="text-primary" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-primary transition-colors"
          >
            <X size={14} />
            Clear filters
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-card rounded-2xl p-4 shadow-sm mb-6 space-y-4">
          {/* City */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              City
            </label>
            <input
              type="text"
              value={cityDraft}
              onChange={(e) => setCityDraft(e.target.value)}
              placeholder="e.g. Yaounde"
              className="w-full bg-background rounded-xl px-4 py-2.5 text-sm text-text placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {RESTAURANT_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() =>
                    setTypeDraft((prev) =>
                      prev === t.type ? undefined : t.type,
                    )
                  }
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                    typeDraft === t.type
                      ? "bg-primary text-white"
                      : "bg-background text-text hover:bg-primary/10"
                  }`}
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>

          {/* Radius */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Radius (km)
            </label>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 25, 50, 100].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() =>
                    setRadiusDraft((prev) =>
                      prev === String(km) ? "" : String(km),
                    )
                  }
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                    radiusDraft === String(km)
                      ? "bg-primary text-white"
                      : "bg-background text-text hover:bg-primary/10"
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
            {radiusDraft && !location && (
              <p className="text-xs text-gray-500 mt-1.5">
                Set your location to filter by distance
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              Apply filters
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 bg-background text-text rounded-xl py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantFilters;
