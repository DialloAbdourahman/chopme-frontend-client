import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { KEYS } from "./utils/keys.ts";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <GoogleOAuthProvider clientId={KEYS.GOOGLE_AUTH_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </Provider>,
);
