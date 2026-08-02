import type { ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./store";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import RestaurantsList from "./pages/RestaurantsList";
import RestaurantDetails from "./pages/RestaurantDetails";
import MenuDetails from "./pages/MenuDetails";
import Checkout from "./pages/Checkout";
import OrderDetails from "./pages/OrderDetails";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useSelector((state: RootState) => state.user);
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Home />} />
        <Route path="/restaurants" element={<Outlet />}>
          <Route index element={<RestaurantsList />} />
          <Route path=":slug" element={<RestaurantDetails />} />
          <Route path=":slug/menu/:menuId" element={<MenuDetails />} />
        </Route>
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route index element={<MyOrders />} />
          <Route path=":orderId" element={<OrderDetails />} />
        </Route>
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
