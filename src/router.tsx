import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import RestaurantsList from "./pages/RestaurantsList";
import RestaurantDetails from "./pages/RestaurantDetails";
import MenuDetails from "./pages/MenuDetails";
import Checkout from "./pages/Checkout";
import OrderDetails from "./pages/OrderDetails";
import MyOrders from "./pages/MyOrders";

const Router = () => {
  // const {user} = useSelector((state: RootState) => state.user);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Home />} />
        <Route path="/restaurants" element={<RestaurantsList />} />
        <Route path="/restaurants/:slug" element={<RestaurantDetails />} />
        <Route
          path="/restaurants/:slug/menu/:menuId"
          element={<MenuDetails />}
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
