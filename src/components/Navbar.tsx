import { ChefHat, MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import type { RootState } from "../store";
import useSetupLocation from "../hooks/useSetupLocation";
import { useSelector } from "react-redux";
import Modal from "./Modal";
import type { FindRestaurantDto } from "chopme-frontend-common";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setupLocation, loadingSetupLocation } = useSetupLocation();
  const { client, userAddressLocalStorage } = useSelector(
    (state: RootState) => state.user,
  );
  const [showModal, setShowModal] = useState(false);

  const location = client?.address ?? userAddressLocalStorage;
  const filters: FindRestaurantDto = {};
  if (location) {
    filters.latitude = location.latitude;
    filters.longitude = location.longitude;
    filters.radiusKm = 100;
  }

  const navLinks = [
    { label: "Home", href: "/" },
    {
      label: "Restaurants",
      href: `/restaurants?page=1&filter=${JSON.stringify(filters)}`,
    },
    { label: "Orders", href: "/orders" },
    { label: "Profile", href: "/profile" },
  ];

  return (
    <>
      <nav className="bg-card shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary rounded-xl p-2">
              <ChefHat size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-text tracking-tight">
              ChopMe
            </span>
          </Link>

          {location ? (
            <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full text-xs font-medium text-text">
              <MapPin size={14} className="text-primary" />
              <span>
                {location.city}, {location.country}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full text-xs font-medium text-text hover:scale-105 transition-transform"
            >
              <MapPin size={14} className="text-primary" />
              <span>Set your location</span>
            </button>
          )}

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.href}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-gray-500 hover:text-primary"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to={"/signin"}
              className="bg-primary text-white rounded-xl px-4 py-2 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              Sign in
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="md:hidden p-2 text-text"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 pb-4 bg-card">
            <div className="flex flex-col gap-3 pt-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-gray-500 hover:text-primary"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link
                to={"/signin"}
                className="w-full bg-primary text-white rounded-xl px-4 py-3 text-sm font-semibold mt-2 text-center"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </nav>
      {showModal && (
        <Modal
          open={showModal}
          setOpen={setShowModal}
          title="Share your location"
          clickOutside={false}
          loading={loadingSetupLocation}
          xlSize="1"
          textButton="Use my location"
          onValidate={async () => {
            await setupLocation();
            setShowModal(false);
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">Find nearby restaurants</span>
            </div>
            <p>
              Share your location to see{" "}
              <span className="text-accent font-medium">restaurants</span> and{" "}
              <span className="text-accent font-medium">dishes</span> near you.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Navbar;
