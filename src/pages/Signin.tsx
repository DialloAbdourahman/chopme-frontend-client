import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { EmailPasswordLoginDto } from "chopme-frontend-common";
import { Eye, EyeOff, Mail, Lock, ChefHat } from "lucide-react";
import { AxiosError } from "axios";
import type { IOrchestrationResult, IAuthEntity } from "chopme-frontend-common";
import {
  emailPasswordLoginSchema,
  EnumStatusCode,
  EnumStatusResponse,
} from "chopme-frontend-common";
import { AuthService } from "../services/auth.service";
import { TokensService } from "../services/tokens.service";
import { KEYS } from "../utils/keys";
import GoogleAuthButton from "../components/GoogleAuthButton";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../utils/toasts";
import useInitializeAfterAuth from "../hooks/useInitializeAfterAuth";

const Signin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const { initialize, loading: loadingInitialize } = useInitializeAfterAuth({
    initialLoadingState: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailPasswordLoginDto>({
    resolver: zodResolver(emailPasswordLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: EmailPasswordLoginDto) => {
    try {
      const { data } = await AuthService.emailPasswordLogin(values);
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
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary rounded-2xl p-4 mb-3 shadow-lg">
            <ChefHat size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text tracking-tight">
            ChopMe
          </h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl shadow-md px-6 py-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text uppercase tracking-wide">
                Email
              </label>
              <div
                className={`flex items-center border rounded-xl px-4 py-3 gap-3 bg-background transition-colors ${
                  errors.email
                    ? "border-red-400"
                    : "border-gray-200 focus-within:border-primary"
                }`}
              >
                <Mail size={18} className="text-gray-400 shrink-0" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="flex-1 bg-transparent outline-none text-text text-sm placeholder-gray-400"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-0.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text uppercase tracking-wide">
                Password
              </label>
              <div
                className={`flex items-center border rounded-xl px-4 py-3 gap-3 bg-background transition-colors ${
                  errors.password
                    ? "border-red-400"
                    : "border-gray-200 focus-within:border-primary"
                }`}
              >
                <Lock size={18} className="text-gray-400 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="flex-1 bg-transparent outline-none text-text text-sm placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-0.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-primary font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || loadingInitialize}
              className="w-full bg-primary text-white font-semibold rounded-xl py-3.5 text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {isSubmitting || loadingInitialize ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">
              or continue with
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <GoogleAuthButton />
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link
            to={"/signup"}
            className="text-primary font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;
