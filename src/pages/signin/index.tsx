import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { EmailPasswordLoginDto } from "chopme-frontend-common";
import { Eye, EyeOff, Mail, Lock, ChefHat } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { AxiosError } from "axios";
import type { IOrchestrationResult, IAuthEntity } from "chopme-frontend-common";
import {
  emailPasswordLoginSchema,
  EnumStatusCode,
  EnumStatusResponse,
} from "chopme-frontend-common";
import { AuthService } from "../../services/auth.service";
import { TokensService } from "../../services/tokens.service";
import { setUser } from "../../store/user.slice";
import { KEYS } from "../../utils/keys";

const Signin = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

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
        const { accessToken, refreshToken, user } = data.data as IAuthEntity;
        TokensService.setToken({
          property: KEYS.ACCESS_TOKEN_KEY,
          value: accessToken,
        });
        TokensService.setToken({
          property: KEYS.REFRESH_TOKEN_KEY,
          value: refreshToken,
        });
        dispatch(setUser(user));
        toast.success("Welcome back!");
      }
    } catch (error) {
      const err = error as AxiosError<IOrchestrationResult<string>>;
      toast.error(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Google login coming soon!");
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
              disabled={isSubmitting}
              className="w-full bg-primary text-white font-semibold rounded-xl py-3.5 text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
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
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3.5 text-sm font-semibold text-text bg-card hover:bg-background active:scale-95 transition-all shadow-sm"
          >
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
          </button>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <button className="text-primary font-semibold hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signin;
