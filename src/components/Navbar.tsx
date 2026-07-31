import { ChefHat, LogOut, MapPin, Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import type { RootState } from "../store";
import { useDispatch, useSelector } from "react-redux";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type FindRestaurantDto,
} from "chopme-frontend-common";
import CartDrawer from "./CartDrawer";
import { AuthService } from "../services/auth.service";
import { TokensService } from "../services/tokens.service";
import {
  clearClient,
  clearUser,
  setOpenAddUserLocationModal,
} from "../store/user.slice";
import { KEYS } from "../utils/keys";
import { showErrorToast, showSuccessToast } from "../utils/toasts";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { client, userAddressLocalStorage, user } = useSelector(
    (state: RootState) => state.user,
  );
  const { cart } = useSelector((state: RootState) => state.cart);
  const [showCart, setShowCart] = useState(false);

  const totalCartItems =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const handleLogout = async () => {
    try {
      const response = await AuthService.logout();
      if (
        response.data.code !== EnumStatusResponse.SUCCESS ||
        response.data.statusCode !== EnumStatusCode.LOGGED_OUT_SUCCESSFULLY
      ) {
        showErrorToast(
          response.data.message ?? "Unable to log out. Please try again.",
        );
        return;
      }

      TokensService.removeToken(KEYS.ACCESS_TOKEN_KEY);
      TokensService.removeToken(KEYS.REFRESH_TOKEN_KEY);
      dispatch(clearUser());
      dispatch(clearClient());
      setIsOpen(false);
      showSuccessToast("You have been logged out.");
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
      showErrorToast("Unable to log out. Please try again.");
    }
  };

  const location = client?.address ?? userAddressLocalStorage;
  const filters: FindRestaurantDto = {};
  if (location) {
    filters.latitude = location.latitude;
    filters.longitude = location.longitude;
    filters.radiusKm = 100;
  }

  const publicLinks = [
    { label: "Home", href: "/" },
    {
      label: "Restaurants",
      href: `/restaurants?page=1&filter=${JSON.stringify(filters)}`,
    },
  ];

  const authLinks = user
    ? [
        { label: "Orders", href: "/orders" },
        { label: "Profile", href: "/profile" },
      ]
    : [];

  const navLinks = [...publicLinks, ...authLinks];

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
              onClick={() => {
                dispatch(setOpenAddUserLocationModal(true));
              }}
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
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-red-600"
              >
                <LogOut size={16} />
                Log out
              </button>
            ) : (
              <Link
                to={"/signin"}
                className="bg-primary text-white rounded-xl px-4 py-2 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
              >
                Sign in
              </Link>
            )}
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
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  <LogOut size={17} />
                  Log out
                </button>
              ) : (
                <Link
                  to={"/signin"}
                  className="w-full bg-primary text-white rounded-xl px-4 py-3 text-sm font-semibold mt-2 text-center"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
      <CartDrawer open={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};

export default Navbar;
