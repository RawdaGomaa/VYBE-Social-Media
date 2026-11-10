
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

  const inputClassName = `
    w-full rounded-2xl border border-[#DDD0FF]
    bg-white/80 px-4 py-3.5
    text-sm font-medium text-[#211936]
    placeholder:text-[#958BAA]
    outline-none transition-all duration-200
    hover:border-violet-300
    focus:border-[#8B5CF6]
    focus:bg-white
    focus:ring-4 focus:ring-[#8B5CF6]/10
    dark:border-[#51416F]
    dark:bg-[#25213A]
    dark:text-[#F5F0FF]
    dark:placeholder:text-[#AAA0BE]
    dark:focus:border-[#A78BFA]
    dark:focus:bg-[#292540]
  `;

  return (
    <div
      className="
        relative isolate flex min-h-[calc(100dvh-80px)]
        w-full items-center justify-center
        overflow-hidden bg-transparent
        px-4 py-10 sm:px-6
      "
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="
          relative z-10 w-full max-w-md
          rounded-[2rem] border border-white/80
          bg-white/90 p-7
          shadow-[0_24px_80px_rgba(68,46,125,0.12)]
          backdrop-blur-xl
          transition-all duration-300
          hover:shadow-[0_28px_85px_rgba(139,92,246,0.18)]
          sm:p-10
          dark:border-[#38304F]
          dark:bg-[#1C1B32]/95
          dark:shadow-[0_24px_80px_rgba(0,0,0,0.30)]
          dark:hover:shadow-[0_28px_85px_rgba(139,92,246,0.15)]
        "
      >
        {/* HEADER */}
        <div className="mb-9 text-center">
          <span
            className="
              inline-flex items-center gap-2 rounded-full
              border border-[#E9DFFF]
              bg-[#F2ECFF] px-4 py-2
              text-xs font-bold text-[#8050D5]
              shadow-sm
              dark:border-[#534080]
              dark:bg-[#34294E]
              dark:text-[#D5BEFF]
            "
          >
            <span className="text-[#8B5CF6]">✦</span>
            Welcome to your space
          </span>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-[#18152C] dark:text-[#F5F0FF]">
            Welcome{" "}
            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
              back!
            </span>
          </h1>

          <p className="mt-3 text-sm text-[#89859A] dark:text-[#AAA4BD]">
            Your people and conversations are waiting.
          </p>
        </div>

        {/* API ERROR */}
        {apiError && (
          <div
            role="alert"
            className="
              mb-5 flex items-start gap-2
              rounded-xl border border-red-200
              bg-red-50 p-3.5 text-sm text-red-700
              dark:border-red-400/20
              dark:bg-red-500/10
              dark:text-red-300
            "
          >
            <span aria-hidden="true">ⓘ</span>
            <p>{apiError}</p>
          </div>
        )}

        {/* EMAIL / USERNAME */}
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

          <p className="mt-1.5 min-h-5 text-xs font-medium text-red-500 dark:text-red-400">
            {errors.login?.message}
          </p>
        </div>

        {/* PASSWORD */}
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

          <p className="mt-1.5 min-h-5 text-xs font-medium text-red-500 dark:text-red-400">
            {errors.password?.message}
          </p>
        </div>

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            group relative w-full overflow-hidden
            rounded-2xl
            bg-gradient-to-r from-[#8B5CF6] to-[#6950E8]
            px-4 py-3.5 font-bold text-white
            shadow-[0_9px_24px_rgba(139,92,246,0.22)]
            transition-all duration-200
            hover:-translate-y-0.5
            hover:shadow-[0_12px_28px_rgba(139,92,246,0.35)]
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

          <span className="relative z-10">
            {isSubmitting ? "Signing in..." : "Login"}
          </span>
        </button>

        {/* REGISTER LINK */}
        <p className="mt-7 text-center text-sm text-[#89859A] dark:text-[#AAA4BD]">
          No account?{" "}
          <Link
            to="/register"
            className="
              font-bold text-[#8B5CF6]
              transition-colors
              hover:text-[#6D28D9]
              hover:underline
              dark:text-[#B69AFF]
              dark:hover:text-[#D5BEFF]
            "
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
