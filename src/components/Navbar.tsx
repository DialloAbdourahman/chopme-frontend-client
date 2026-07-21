import { ChefHat, MapPin, Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import type { RootState } from "../store";
import { useSelector } from "react-redux";
import type { FindRestaurantDto } from "chopme-frontend-common";
import AddUserLocation from "./AddUserLocation";
import CartDrawer from "./CartDrawer";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { client, userAddressLocalStorage } = useSelector(
    (state: RootState) => state.user,
  );
  const { cart } = useSelector((state: RootState) => state.cart);
  const [showModal, setShowModal] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const totalCartItems =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

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
                {/* {location.city}, {location.country} */}
                {location.city}
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
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 text-text hover:text-primary transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={22} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalCartItems > 9 ? "9+" : totalCartItems}
                </span>
              )}
            </button>
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

          {/* Mobile actions */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 text-text hover:text-primary transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={22} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalCartItems > 9 ? "9+" : totalCartItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="p-2 text-text"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
      <AddUserLocation setShowModal={setShowModal} showModal={showModal} />
      <CartDrawer open={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};

export default Navbar;
