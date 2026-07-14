import useInitializeAfterAuth from "../hooks/useInitializeAfterAuth";
import { KEYS } from "../utils/keys";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../utils/toasts";
import { useGoogleLogin } from "@react-oauth/google";
import { AxiosError } from "axios";
import type { IOrchestrationResult, IAuthEntity } from "chopme-frontend-common";
import { EnumStatusCode, EnumStatusResponse } from "chopme-frontend-common";
import { AuthService } from "../services/auth.service";
import { TokensService } from "../services/tokens.service";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

const GoogleAuthButton = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const { initialize, loading: loadingInitialize } = useInitializeAfterAuth({
    initialLoadingState: false,
  });

  const initiateGooglePopup = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }: { code: string }) => {
      try {
        setIsLoading(true);
        const { data } = await AuthService.googleLogin(code);
        if (
          data.code === EnumStatusResponse.SUCCESS &&
          data.statusCode === EnumStatusCode.LOGGED_IN_SUCCESSFULLY
        ) {
          const { accessToken, refreshToken } = data.data as IAuthEntity;
          TokensService.setToken({
            property: KEYS.ACCESS_TOKEN_KEY,
            value: accessToken,
          });
          TokensService.setToken({
            property: KEYS.REFRESH_TOKEN_KEY,
            value: refreshToken,
          });
          await initialize();
          showSuccessToast("Welcome back!");
          const encoded = searchParams.get("redirect_url");
          const redirectTo = encoded ? decodeURIComponent(encoded) : "/";
          navigate(redirectTo, { replace: true });
        }
      } catch (error) {
        const err = error as AxiosError<IOrchestrationResult<string>>;
        switch (err.response.data.statusCode) {
          case EnumStatusCode.INVALID_CREDENTIALS:
            showWarningToast("Invalid credentials. Please try again.");
            break;
          case EnumStatusCode.LOGIN_METHOD_NOT_ALLOWED:
            showWarningToast("Login method not allowed. Please try again.");
            break;
          case EnumStatusCode.VALIDATION_ERROR:
            showWarningToast("Please check your input and try again.");
            break;
          case EnumStatusCode.INTERNAL_SERVER_ERROR:
            showErrorToast("Something went wrong. Please try again.");
            break;
          default:
            showErrorToast("Something went wrong. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      showErrorToast("Unable to authenticate with google");
    },
  });

  return (
    <button
      onClick={initiateGooglePopup}
      disabled={loadingInitialize || isLoading}
      className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3.5 text-sm font-semibold text-text bg-card hover:bg-background active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loadingInitialize || isLoading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </>
      )}
    </button>
  );
};

export default GoogleAuthButton;
