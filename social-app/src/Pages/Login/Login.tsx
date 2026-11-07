import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const schema = z.object({
  login: z.string().trim().min(3, "Enter your email or username"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof schema>;

export default function Login() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
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
      setApiError(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <div className="vybe-auth min-h-[calc(100vh-80px)] flex items-center justify-center py-10">
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="vybe-auth-card w-full max-w-md rounded-[2rem] border border-violet-100 bg-white p-8 shadow-[0_24px_80px_rgba(68,46,125,.12)] sm:p-10"
    >
      <div className="mb-9 text-center"><span className="vybe-pill">✦ Welcome to your space</span><h1 className="mt-5 text-4xl font-black tracking-tight text-[#18152C]">Welcome <span className="text-[#8B5CF6]">back!</span></h1><p className="mt-3 text-sm text-[#89859A]">Your people and conversations are waiting.</p></div>

      {apiError && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {apiError}
        </div>
      )}

      <label className="mb-1 block text-sm font-medium">
        Email or username
      </label>

      <input
        {...register("login")}
        className="vybe-input mb-1 w-full rounded-2xl border border-violet-100 bg-[#F7F5FF] p-3.5 outline-none focus:border-[#8B5CF6]"
        placeholder="email@example.com or username"
      />

      <p className="mb-4 min-h-5 text-sm text-red-500">
        {errors.login?.message}
      </p>

      <label className="mb-1 block text-sm font-medium">
        Password
      </label>

      <input
        {...register("password")}
        type="password"
        autoComplete="current-password"
        className="vybe-input mb-1 w-full rounded-2xl border border-violet-100 bg-[#F7F5FF] p-3.5 outline-none focus:border-[#8B5CF6]"
        placeholder="Your password"
      />

      <p className="mb-4 min-h-5 text-sm text-red-500">
        {errors.password?.message}
      </p>

      <button
        disabled={isSubmitting}
        className="vybe-primary w-full rounded-2xl bg-[#8B5CF6] px-4 py-3.5 font-bold text-white transition hover:bg-[#7C3AED] disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Login"}
      </button>

      <p className="mt-4 text-center text-sm text-gray-500">
        No account?{" "}
        <Link
          to="/register"
          className="font-semibold text-[#8B5CF6]"
        >
          Register
        </Link>
      </p>
    </form>
  </div>
  );
}
