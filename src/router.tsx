import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signin from "./pages/signin";
import Signup from "./pages/signup";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/"
          element={
            <div className="flex justify-center ">
              <h1 className=" text-red-500">Home page</h1>
            </div>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
