
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";

const passwordRule = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const schema = z.object({
  password: z.string().min(8, "Current password must be at least 8 characters"),
  newPassword: z.string().regex(passwordRule, "Min 8 chars with uppercase, lowercase and a number"),
  rePassword: z.string(),
}).refine((values) => values.newPassword === values.rePassword, {
  path: ["rePassword"],
  message: "Passwords do not match",
});

type Form = z.infer<typeof schema>;

export default function Settings() {
  const { changePassword, logout } = useAuth();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      newPassword: "",
      rePassword: "",
    },
    mode: "onTouched",
  });

  const submit = async (values: Form) => {
    setError("");
    setMessage("");

    try {
      await changePassword(values.password, values.newPassword);
      setMessage("Password changed successfully");
      reset();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not change password"
      );
    }
  };

  const fieldClass =
    "w-full rounded-2xl border border-violet-100 bg-[#F7F5FF] px-4 py-3.5 text-sm font-medium text-[#211936] outline-none transition-all duration-200 placeholder:text-[#A39BB5] hover:border-violet-200 focus:border-[#8B5CF6] focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-[#51416F] dark:bg-[#25213A] dark:text-[#F5F0FF] dark:placeholder:text-[#8984A3] dark:hover:border-violet-400 dark:focus:border-violet-400 dark:focus:bg-[#29243F]";

  return (
    <main className="mx-auto min-h-[calc(100vh-80px)] w-full max-w-4xl px-4 py-8 sm:px-6">

      {/* Header */}
      <section className="mb-8">
        <span className="vybe-pill mb-3">
          ✦ Manage your account
        </span>

        <h1 className="text-3xl font-black tracking-tight text-[#18152C] dark:text-[#F5F0FF] sm:text-4xl">
          Account <span className="text-[#8B5CF6]">Settings</span>
        </h1>

        <p className="mt-2 text-sm text-[#89859A] dark:text-[#AAA4BD]">
          Manage your security and keep your account protected.
        </p>
      </section>

      {/* Password Card */}
      <section className="premium-panel overflow-hidden">

        <div className="border-b border-violet-100 p-5 sm:p-7 dark:border-[#383651]">
          <div className="flex items-center gap-4">

            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-violet-100 text-[#8B5CF6] dark:bg-[#34294E]">
              <svg
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <path d="M12 15v3" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-[#282040] dark:text-[#F1ECFF]">
                Change password
              </h2>

              <p className="mt-1 text-xs text-[#9891A9] dark:text-[#AAA4BD]">
                Update your password to keep your account secure.
              </p>
            </div>

          </div>
        </div>

        <form
          onSubmit={handleSubmit(submit)}
          className="space-y-5 p-5 sm:p-7"
        >

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
            >
              <span>ⓘ</span>
              <p>{error}</p>
            </div>
          )}

          {/* Success */}
          {message && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              <span>✓</span>
              <p>{message}</p>
            </div>
          )}

          <div>
            <h3 className="mb-1 text-sm font-extrabold text-[#282040] dark:text-[#F1ECFF]">
              Security information
            </h3>

            <p className="mb-5 text-xs text-[#9891A9] dark:text-[#AAA4BD]">
              Enter your current password before choosing a new one.
            </p>

            <Input
              label="Current password"
              error={errors.password?.message}
            >
              <input
                {...register("password")}
                type="password"
                autoComplete="current-password"
                placeholder="Enter your current password"
                className={fieldClass}
              />
            </Input>

            <div className="my-6 border-t border-violet-100 dark:border-[#383651]" />

            <Input
              label="New password"
              error={errors.newPassword?.message}
            >
              <input
                {...register("newPassword")}
                type="password"
                autoComplete="new-password"
                placeholder="Enter your new password"
                className={fieldClass}
              />
            </Input>

            <Input
              label="Confirm new password"
              error={errors.rePassword?.message}
            >
              <input
                {...register("rePassword")}
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                className={fieldClass}
              />
            </Input>
          </div>

          {/* Password Requirements */}
          <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4 dark:border-[#51416F] dark:bg-[#242039]">
            <p className="mb-3 text-xs font-extrabold text-[#51456E] dark:text-[#E5DCFA]">
              Password requirements
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "At least 8 characters",
                "One uppercase letter",
                "One lowercase letter",
                "At least one number",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs text-[#89819D] dark:text-[#AAA4BD]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6950E8] px-5 py-3.5 font-bold text-white shadow-[0_8px_24px_rgba(139,92,246,.20)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(139,92,246,.30)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto sm:min-w-52"
          >
            {isSubmitting ? "Updating password..." : "Save new password"}
          </button>

        </form>
      </section>

      {/* Logout Section */}
      <section className="mt-6 rounded-3xl border border-red-100 bg-white p-5 shadow-sm dark:border-red-400/20 dark:bg-[#1B1C32] sm:p-6">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h3 className="font-extrabold text-[#282040] dark:text-[#F1ECFF]">
              Sign out
            </h3>

            <p className="mt-1 text-xs text-[#9891A9] dark:text-[#AAA4BD]">
              Sign out of your VYBE account on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
          >
            Logout
          </button>

        </div>
      </section>

      <p className="mt-6 text-center text-xs text-[#AAA4B6] dark:text-[#77738F]">
        VYBE · Good things start with a conversation.
      </p>

    </main>
  );
}

function Input({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-sm font-semibold text-[#29243C] dark:text-[#E9E3F8]">
        {label}
      </span>

      {children}

      <span className="mt-1 block min-h-5 text-xs text-red-500 dark:text-red-400">
        {error}
      </span>
    </label>
  );
}
