import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  EnumAuthType,
  EnumStatusCode,
  EnumStatusResponse,
  updateClientInformationSchema,
  updatePasswordSchema,
  updateUserProfileSchema,
  type UpdateClientInformationDto,
  type UpdatePasswordDto,
  type UpdateUserProfileDto,
} from "chopme-frontend-common";
import { ArrowLeft, Eye, EyeOff, User } from "lucide-react";
import Navbar from "../components/Navbar";
import DeliveryAddressSection from "../components/DeliveryAddressSection";
import { ClientService } from "../services/client.service";
import { UserService } from "../services/user.service";
import { setClient, setUser } from "../store/user.slice";
import type { RootState } from "../store";
import { ComputeUtils } from "../utils/compute-utils";
import { showErrorToast, showSuccessToast } from "../utils/toasts";

const phoneFormSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^6\d{8}$/, "Phone number must be a valid number like 677552485"),
});

type PhoneFormValues = z.infer<typeof phoneFormSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, client } = useSelector((state: RootState) => state.user);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const clientPhone = client?.phoneNumber ?? "";
  const initialPhone = clientPhone.startsWith("+237")
    ? clientPhone.slice(4)
    : clientPhone;

  const canUpdatePassword = user?.authType === EnumAuthType.EMAIL_PASSWORD;

  const {
    register: registerFullName,
    handleSubmit: handleSubmitFullName,
    reset: resetFullName,
    formState: {
      errors: fullNameErrors,
      isSubmitting: isSubmittingFullName,
      isDirty: isFullNameDirty,
    },
  } = useForm<UpdateUserProfileDto>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: { fullName: user?.fullName ?? "" },
  });

  const {
    register: registerPhone,
    handleSubmit: handleSubmitPhone,
    reset: resetPhone,
    formState: {
      errors: phoneErrors,
      isSubmitting: isSubmittingPhone,
      isDirty: isPhoneDirty,
    },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phoneNumber: initialPhone },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<UpdatePasswordDto>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitFullName = async (values: UpdateUserProfileDto) => {
    try {
      const result = await UserService.updateMyProfile(values);
      if (
        result.data.code === EnumStatusResponse.SUCCESS &&
        result.data.statusCode === EnumStatusCode.UPDATED_SUCCESSFULLY &&
        result.data.data
      ) {
        dispatch(setUser(result.data.data));
        resetFullName({ fullName: result.data.data.fullName });
        showSuccessToast("Full name updated successfully.");
      } else {
        showErrorToast(result.data.message ?? "Failed to update full name.");
      }
    } catch {
      showErrorToast("Failed to update full name. Please try again.");
    }
  };

  const onSubmitPhone = async (values: PhoneFormValues) => {
    const dto: UpdateClientInformationDto = {
      phoneNumber: `+237${values.phoneNumber}`,
    };

    const validation = updateClientInformationSchema.safeParse(dto);
    if (!validation.success) {
      showErrorToast(
        validation.error.issues[0]?.message ?? "Invalid phone number.",
      );
      return;
    }

    try {
      const result = await ClientService.updateMyInformation(dto);
      if (
        result.data.code === EnumStatusResponse.SUCCESS &&
        result.data.statusCode === EnumStatusCode.UPDATED_SUCCESSFULLY &&
        result.data.data
      ) {
        dispatch(setClient(result.data.data));
        const next = result.data.data.phoneNumber?.startsWith("+237")
          ? result.data.data.phoneNumber.slice(4)
          : (result.data.data.phoneNumber ?? "");
        resetPhone({ phoneNumber: next });
        showSuccessToast("Phone number updated successfully.");
      } else {
        showErrorToast(result.data.message ?? "Failed to update phone number.");
      }
    } catch {
      showErrorToast("Failed to update phone number. Please try again.");
    }
  };

  const onSubmitPassword = async (values: UpdatePasswordDto) => {
    try {
      const result = await UserService.updatePassword(values);
      if (
        result.data.code === EnumStatusResponse.SUCCESS &&
        result.data.statusCode === EnumStatusCode.UPDATED_SUCCESSFULLY
      ) {
        resetPassword();
        showSuccessToast("Password updated successfully.");
      } else {
        showErrorToast(result.data.message ?? "Failed to update password.");
      }
    } catch {
      showErrorToast("Failed to update password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">My profile</h1>
            <p className="text-xs text-gray-500">
              Manage your account information
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Personal info */}
          <form
            onSubmit={handleSubmitFullName(onSubmitFullName)}
            className="bg-card rounded-2xl p-4 shadow-sm space-y-4"
          >
            <h2 className="text-sm font-semibold text-text">
              Personal information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  {...registerFullName("fullName")}
                  className={`w-full bg-background border text-text text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                    fullNameErrors.fullName ? "border-red-400" : "border-border"
                  }`}
                />
                {fullNameErrors.fullName && (
                  <p className="text-xs text-red-500 mt-1">
                    {fullNameErrors.fullName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="w-full bg-gray-100 border border-border text-gray-500 text-sm rounded-xl px-3 py-2 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Account type
                </label>
                <input
                  type="text"
                  value={user?.authType ?? ""}
                  disabled
                  className="w-full bg-gray-100 border border-border text-gray-500 text-sm rounded-xl px-3 py-2 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Member since
                </label>
                <input
                  type="text"
                  value={
                    user?.createdAt
                      ? ComputeUtils.formatDate(user.createdAt)
                      : ""
                  }
                  disabled
                  className="w-full bg-gray-100 border border-border text-gray-500 text-sm rounded-xl px-3 py-2 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingFullName || !isFullNameDirty}
              className="bg-primary text-white text-sm font-semibold rounded-xl px-4 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSubmittingFullName ? "Saving..." : "Save full name"}
            </button>
          </form>

          {/* Contact info */}
          <form
            onSubmit={handleSubmitPhone(onSubmitPhone)}
            className="bg-card rounded-2xl p-4 shadow-sm space-y-4"
          >
            <h2 className="text-sm font-semibold text-text">Contact</h2>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Phone number
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text bg-background border border-border rounded-xl px-3 py-2">
                  +237
                </span>
                <input
                  type="tel"
                  {...registerPhone("phoneNumber")}
                  placeholder="677552485"
                  className={`flex-1 bg-background border text-text text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                    phoneErrors.phoneNumber ? "border-red-400" : "border-border"
                  }`}
                />
              </div>
              {phoneErrors.phoneNumber && (
                <p className="text-xs text-red-500 mt-1">
                  {phoneErrors.phoneNumber.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmittingPhone || !isPhoneDirty}
              className="bg-primary text-white text-sm font-semibold rounded-xl px-4 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSubmittingPhone ? "Saving..." : "Save phone number"}
            </button>
          </form>

          {/* Password update */}
          {canUpdatePassword && (
            <form
              onSubmit={handleSubmitPassword(onSubmitPassword)}
              className="bg-card rounded-2xl p-4 shadow-sm space-y-4"
            >
              <h2 className="text-sm font-semibold text-text">
                Update password
              </h2>

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">
                    Current password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      {...registerPassword("oldPassword")}
                      placeholder="Current password"
                      className={`w-full bg-background border text-text text-sm rounded-xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary ${
                        passwordErrors.oldPassword
                          ? "border-red-400"
                          : "border-border"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      aria-label="Toggle current password visibility"
                    >
                      {showOldPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.oldPassword && (
                    <p className="text-xs text-red-500">
                      {passwordErrors.oldPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      {...registerPassword("newPassword")}
                      placeholder="New password"
                      className={`w-full bg-background border text-text text-sm rounded-xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary ${
                        passwordErrors.newPassword
                          ? "border-red-400"
                          : "border-border"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      aria-label="Toggle new password visibility"
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-red-500">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    {...registerPassword("confirmPassword")}
                    placeholder="Confirm new password"
                    className={`w-full bg-background border text-text text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                      passwordErrors.confirmPassword
                        ? "border-red-400"
                        : "border-border"
                    }`}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="bg-primary text-white text-sm font-semibold rounded-xl px-4 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSubmittingPassword ? "Updating..." : "Update password"}
              </button>
            </form>
          )}

          {/* Address */}
          <DeliveryAddressSection />
        </div>
      </div>
    </div>
  );
};

export default Profile;
