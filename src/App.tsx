import { useEffect } from "react";
import Router from "./router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useInitializeAfterAuth from "./hooks/useInitializeAfterAuth";
import WebSocket from "./components/WebSocket";

function App() {
  const { initialize, loading } = useInitializeAfterAuth({
    initialLoadingState: true,
  });

  useEffect(() => {
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
      <WebSocket />
      <Router />
    </>
  );
}

export default App;
