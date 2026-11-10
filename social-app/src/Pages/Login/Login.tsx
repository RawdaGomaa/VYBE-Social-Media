
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import { getApiError } from "../../lib/api";
import { useState } from "react";

const schema = z.object({
  login: z.string().trim().min(3, "Please enter your email or username."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type LoginForm = z.infer<typeof schema>;

export default function Login() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { login: "", password: "" },
    mode: "onTouched",
  });

  if (token) return <Navigate to="/posts" replace />;

  const onSubmit = async (values: LoginForm) => {
    setApiError("");

    try {
      await login(values.login, values.password);
      navigate("/posts");
    } catch (error) {
      setApiError(getApiError(error));
    }
  };

  const inputClassName =
    "w-full rounded-2xl border border-violet-200/80 bg-white/70 px-4 py-4 text-sm font-medium text-[#211936] placeholder:text-[#958BAA] outline-none transition-all duration-300 hover:border-violet-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/15 dark:border-[#51416F] dark:bg-[#25213A]/80 dark:text-[#F5F0FF] dark:placeholder:text-[#AAA0BE] dark:hover:border-violet-400 dark:focus:border-violet-400 dark:focus:bg-[#29243F] dark:focus:ring-violet-400/15";

  return (
    <div className="relative isolate flex min-h-[calc(100dvh-80px)] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#F8F7FE] via-[#F3EEFF] to-[#EDE7FF] px-4 py-12 dark:from-[#101120] dark:via-[#17152B] dark:to-[#211A38]">

      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-violet-400/20 blur-[120px] transition-opacity duration-700 dark:bg-violet-600/20" />

      <div className="pointer-events-none absolute -right-32 top-1/4 h-[420px] w-[420px] rounded-full bg-purple-400/20 blur-[120px] dark:bg-purple-600/20" />

      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[380px] w-[380px] rounded-full bg-indigo-400/15 blur-[110px] dark:bg-indigo-600/15" />

      {/* Login Card */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 p-8 shadow-[0_25px_80px_rgba(91,61,160,0.12)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(139,92,246,0.20)] sm:p-10 dark:border-white/10 dark:bg-[#1C1B32]/80 dark:shadow-[0_25px_80px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_30px_90px_rgba(139,92,246,0.15)]"
      >
        {/* Card Glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/10" />

        <div className="relative mb-9 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50/90 px-4 py-2 text-xs font-bold text-violet-700 shadow-sm transition-all duration-300 hover:scale-105 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
            <span className="text-violet-500">✦</span>
            Welcome to your space
          </span>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-[#18152C] dark:text-[#F5F0FF]">
            Welcome{" "}
            <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
              back!
            </span>
          </h1>

          <p className="mt-3 text-sm text-[#89859A] dark:text-[#AAA4BD]">
            Your people and conversations are waiting.
          </p>
        </div>

        {/* API Error */}
        {apiError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
          >
            <span aria-hidden="true">ⓘ</span>
            <p>{apiError}</p>
          </div>
        )}

        {/* Email */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-[#29243C] dark:text-[#E9E3F8]">
            Email or username
          </label>

          <input
            {...register("login", {
              onChange: () => setApiError(""),
            })}
            type="text"
            autoComplete="username"
            className={inputClassName}
            placeholder="email@example.com or username"
          />

          <p className="mt-1 min-h-5 text-xs text-red-500 dark:text-red-400">
            {errors.login?.message}
          </p>
        </div>

        {/* Password */}
        <div className="mb-7">
          <label className="mb-2 block text-sm font-semibold text-[#29243C] dark:text-[#E9E3F8]">
            Password
          </label>

          <input
            {...register("password", {
              onChange: () => setApiError(""),
            })}
            type="password"
            autoComplete="current-password"
            className={inputClassName}
            placeholder="Your password"
          />

          <p className="mt-1 min-h-5 text-xs text-red-500 dark:text-red-400">
            {errors.password?.message}
          </p>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 px-4 py-4 font-bold text-white shadow-[0_8px_25px_rgba(139,92,246,0.25)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_12px_35px_rgba(139,92,246,0.4)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

          <span className="relative z-10">
            {isSubmitting ? "Signing in..." : "Login"}
          </span>
        </button>

        {/* Register Link */}
        <p className="mt-7 text-center text-sm text-gray-500 dark:text-[#AAA4BD]">
          No account?{" "}
          <Link
            to="/register"
            className="font-bold text-violet-600 transition-all duration-200 hover:text-violet-800 hover:underline dark:text-violet-400 dark:hover:text-violet-300"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
