import { Search, ChefHat, Store, Phone } from "lucide-react";
import Navbar from "../components/Navbar";
import RestaurantsInHomepage from "../components/RestaurantsInHomepage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { RootState } from "../store";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import type { FindRestaurantDto } from "chopme-frontend-common";

import usePromptLocation from "../hooks/usePromptLocation";

const Home = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { client, userAddressLocalStorage } = useSelector(
    (state: RootState) => state.user,
  );
  const { promptLocation } = usePromptLocation();

  const location = client?.address ?? userAddressLocalStorage;

  const filters: FindRestaurantDto = {};
  if (location) {
    filters.latitude = location.latitude;
    filters.longitude = location.longitude;
    filters.radiusKm = 100;
  }
  if (search) {
    filters.search = search;
  }

  useEffect(() => {
    promptLocation();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="px-4 pt-8 pb-12 md:pt-14 md:pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-primary to-orange-600 rounded-3xl p-6 md:p-12 text-white shadow-lg relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-10 w-48 h-48 bg-accent/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium mb-4">
                <ChefHat size={14} />
                <span>{t("home.heroBadge")}</span>
              </div>

              <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-3">
                {t("home.heroTitle")}
              </h1>
              <p className="text-sm md:text-base text-white/90 mb-6 max-w-lg">
                {t("home.heroDescription")}
              </p>

              {/* Search bar */}
              <div className="bg-white rounded-2xl p-2 flex items-center gap-2 max-w-md shadow-md">
                <div className="bg-background p-2 rounded-xl flex-shrink-0">
                  <Search size={18} className="text-primary" />
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("home.searchPlaceholder")}
                  className="flex-1 min-w-0 bg-transparent outline-none text-text text-sm placeholder-gray-400"
                />

                <Link
                  to={`/restaurants?page=1&filter=${JSON.stringify(filters)}`}
                  className="flex-shrink-0 bg-primary text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  {t("common.search")}
                </Link>
              </div>

              {/* Quick tags */}
              <div className="flex flex-wrap gap-2 mt-5">
                {[
                  { key: "pizza", label: t("home.tagsPizza") },
                  { key: "local", label: t("home.tagsLocal") },
                  { key: "sushi", label: t("home.tagsSushi") },
                  { key: "desserts", label: t("home.tagsDesserts") },
                ].map((tag) => (
                  <span
                    key={tag.key}
                    className="bg-white/20 hover:bg-white/30 transition-colors text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer"
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <RestaurantsInHomepage location={location ?? undefined} />

      {/* How it works */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-text text-center mb-8">
            {t("home.howItWorks")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: t("home.chooseRestaurantTitle"),
                desc: t("home.chooseRestaurantDesc"),
              },
              {
                title: t("home.buildOrderTitle"),
                desc: t("home.buildOrderDesc"),
              },
              {
                title: t("home.enjoyDeliveryTitle"),
                desc: t("home.enjoyDeliveryDesc"),
              },
            ].map((step, index) => (
              <div
                key={step.title}
                className="bg-card rounded-2xl p-6 text-center shadow-sm"
              >
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">
                  {index + 1}
                </div>
                <h3 className="font-bold text-text text-sm mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Register your restaurant */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-card rounded-3xl p-6 md:p-10 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 py-1.5 text-xs font-semibold mb-3">
                <Store size={14} />
                <span>{t("home.forRestaurantOwners")}</span>
              </div>
              <h2 className="text-xl font-bold text-text mb-2">
                {t("home.registerTitle")}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {t("home.registerDesc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <button className="bg-primary text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all">
                  {t("home.getStarted")}
                </button>
                <a
                  href="tel:+237123456789"
                  className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-6 py-3 text-sm font-semibold text-text hover:bg-background transition-colors"
                >
                  <Phone size={16} className="text-primary" />
                  {t("home.callUs")}
                </a>
              </div>
            </div>
            <div className="w-full md:w-auto flex-shrink-0">
              <div className="bg-background rounded-2xl p-5 w-full md:w-64">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-success/10 text-success rounded-full p-2">
                    <Store size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">
                      {t("home.growBusinessTitle")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("home.growBusinessDesc")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-accent/10 text-accent rounded-full p-2">
                    <ChefHat size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">
                      {t("home.focusOnFoodTitle")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("home.focusOnFoodDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
