
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
    "vybe-input mb-1 w-full rounded-2xl border border-[#D8C8FF] bg-[#F3EEFF] p-3.5 text-[#211936] placeholder:text-[#958BAA] outline-none transition-all duration-200 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 dark:border-[#51416F] dark:bg-[#25213A] dark:text-[#F5F0FF] dark:placeholder:text-[#AAA0BE] dark:focus:border-[#A78BFA] dark:focus:ring-[#A78BFA]/20";

  return (
    <div className="vybe-auth flex min-h-[calc(100vh-80px)] items-center justify-center py-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="vybe-auth-card w-full max-w-md rounded-[2rem] border border-violet-100 bg-white p-8 shadow-[0_24px_80px_rgba(68,46,125,.12)] sm:p-10 dark:border-[#38304F] dark:bg-[#1C1B32]"
      >
        <div className="mb-9 text-center">
          <span className="vybe-pill">
            ✦ Welcome to your space
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-[#18152C] dark:text-[#F5F0FF]">
            Welcome <span className="text-[#8B5CF6]">back!</span>
          </h1>

          <p className="mt-3 text-sm text-[#89859A] dark:text-[#AAA4BD]">
            Your people and conversations are waiting.
          </p>
        </div>

        {apiError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
          >
            <span aria-hidden="true">ⓘ</span>
            <p>{apiError}</p>
          </div>
        )}

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

        <p className="mb-5 min-h-5 text-sm text-red-500 dark:text-red-400">
          {errors.login?.message}
        </p>

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

        <p className="mb-5 min-h-5 text-sm text-red-500 dark:text-red-400">
          {errors.password?.message}
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="vybe-primary w-full rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6950E8] px-4 py-3.5 font-bold text-white shadow-[0_8px_24px_rgba(139,92,246,.2)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#7C3AED] hover:to-[#5B43D6] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-[#AAA4BD]">
          No account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#8B5CF6] transition hover:text-[#6D4AE0]"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
