import { useEffect, useState } from "react";
import Router from "./router";
import { useDispatch } from "react-redux";
import { AuthService } from "./services/auth.service";
import { setUser } from "./store/user.slice";
import {
  EnumStatusCode,
  EnumStatusResponse,
  type IOrchestrationResult,
} from "chopme-frontend-common";
import { AxiosError } from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data } = await AuthService.getMyProfile();
        if (
          data.code === EnumStatusResponse.SUCCESS &&
          data.statusCode === EnumStatusCode.RECOVERED_SUCCESSFULLY &&
          data.data
        ) {
          dispatch(setUser(data.data));
        }
      } catch (error) {
        const err = error as AxiosError<IOrchestrationResult<string>>;
        const statusCode = err.response?.data?.statusCode;
        console.log("statusCode", statusCode);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Router />
    </>
  );
}

export default App;
