import { ArrowLeft, Search, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type FindRestaurantDto,
  type IRestaurantEntity,
} from "chopme-frontend-common";
import Navbar from "../components/Navbar";
import RestaurantCard from "../components/RestaurantCard";
import { RestaurantService } from "../services/restaurant.service";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import RestaurantFilters from "../components/RestaurantFilters";
import AddUserLocation from "../components/AddUserLocation";
import Pagination from "../components/Pagination";

const parseFilters = (value: string | null): FindRestaurantDto => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const RestaurantsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [restaurants, setRestaurants] = useState<IRestaurantEntity[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const limit = 10;

  // Initialize state from search params
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page")) || 1,
  );

  const [filters, setFilters] = useState<FindRestaurantDto>(
    parseFilters(searchParams.get("filter")),
  );

  const [search, setSearch] = useState(filters?.search ?? "");

  const { client, userAddressLocalStorage } = useSelector(
    (state: RootState) => state.user,
  );
  const [showModal, setShowModal] = useState(false);

  const location = client?.address ?? userAddressLocalStorage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchTerm = search.trim();
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      search: searchTerm || undefined,
    }));
  };

  const handleApplyFilters = (newFilters: FindRestaurantDto) => {
    setPage(1);
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setPage(1);
    setFilters((prev) => ({
      search: prev?.search,
    }));
  };

  useEffect(() => {
    if (location) {
      const newFilters = {
        ...filters,
        longitude: location.longitude,
        latitude: location.latitude,
        radiusKm: 100,
      };
      handleApplyFilters(newFilters);
    }
  }, [location]);

  useEffect(() => {
    const initializeLocation = async () => {
      if (!location) {
        setShowModal(true);
      }
    };
    initializeLocation();
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {
      page: String(page),
    };
    if (filters && Object.keys(filters).length > 0) {
      params.filter = JSON.stringify(filters);
    }
    setSearchParams(params, { replace: true });

    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const result = await RestaurantService.search({
          page,
          limit,
          filters: filters ?? {},
        });

        if (
          result.data.code === EnumStatusResponse.SUCCESS &&
          result.data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
          result.data.data
        ) {
          setRestaurants(result.data.data.items);
          setTotalPages(result.data.data.totalPages);
        }
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [page, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <AddUserLocation setShowModal={setShowModal} showModal={showModal} />

      {/* {JSON.stringify(filters)} */}

      <section className="px-4 pt-8 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-2"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>
            <h1 className="text-2xl font-bold text-text">Restaurants</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Search and discover the best places to eat
            </p>
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-2 flex items-center gap-2 shadow-sm mb-8"
          >
            <div className="bg-background p-2 rounded-xl">
              <Search size={18} className="text-primary" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a restaurant..."
              className="flex-1 bg-transparent text-sm text-text placeholder-gray-400 outline-none min-w-0"
            />
            <button
              type="submit"
              className="bg-primary text-white rounded-xl px-4 py-2 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              Search
            </button>
          </form>

          {/* Filters */}
          <RestaurantFilters
            filters={filters}
            location={location}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl h-48 animate-pulse"
                />
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-card rounded-full p-4 mb-4">
                <Store size={28} className="text-primary" />
              </div>
              <h3 className="font-semibold text-text">No restaurants found</h3>
              <p className="text-sm text-gray-500 mt-1">
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default RestaurantsList;
