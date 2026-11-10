
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import { useState, type ReactNode } from "react";

const passwordRule = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

const registerSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(50, "Name is too long"),
  username: z.string().trim().regex(/^[a-zA-Z0-9_]{3,30}$/, "Use 3-30 letters, numbers or _ only"),
  email: z.email("Enter a valid email"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"]),
  password: z.string().regex(passwordRule, "Min 8 chars with uppercase, lowercase and a number"),
  rePassword: z.string(),
}).refine((data) => data.password === data.rePassword, {
  path: ["rePassword"],
  message: "Passwords do not match",
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { registerUser, token } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      username: "",
      email: "",
      dateOfBirth: "",
      gender: "male",
      password: "",
      rePassword: "",
    },
  });

  if (token) return <Navigate to="/posts" replace />;

  const onSubmit = async (values: RegisterForm) => {
    setApiError("");

    try {
      await registerUser(values);
      navigate("/posts");
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  };

  const fieldClass = `
    w-full rounded-2xl border border-[#DDD0FF]
    bg-white/80 px-4 py-3.5 text-sm text-[#211936]
    placeholder:text-[#958BAA]
    outline-none transition-all duration-200
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
        relative isolate flex w-full
        min-h-[calc(100dvh-80px)]
        items-center justify-center
        overflow-hidden px-4 py-10 sm:px-6
        bg-[radial-gradient(ellipse_at_5%_5%,rgba(168,139,250,0.20),transparent_55%),radial-gradient(ellipse_at_100%_55%,rgba(196,181,253,0.22),transparent_60%),linear-gradient(180deg,#F8F7FE,#F0EAFE)]
        dark:bg-[radial-gradient(ellipse_at_5%_5%,rgba(114,76,212,0.19),transparent_55%),radial-gradient(ellipse_at_100%_55%,rgba(131,102,225,0.13),transparent_60%),linear-gradient(180deg,#101120,#211A38)]
      "
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="
          relative z-10 w-full max-w-2xl
          rounded-[2rem] border border-white/80
          bg-white/90 p-6
          shadow-[0_24px_80px_rgba(68,46,125,0.12)]
          backdrop-blur-xl
          sm:p-10
          dark:border-[#38304F]
          dark:bg-[#1C1B32]/95
          dark:shadow-[0_24px_80px_rgba(0,0,0,0.30)]
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
            ✨ Your community starts here
          </span>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-[#18152C] sm:text-4xl dark:text-[#F5F0FF]">
            Create your{" "}
            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
              VYBE
            </span>{" "}
            account
          </h1>

          <p className="mt-3 text-sm text-[#89859A] dark:text-[#AAA4BD]">
            Meet people, share moments, make connections.
          </p>
        </div>

        {/* API ERROR */}
        {apiError && (
          <div
            role="alert"
            className="
              mb-6 flex items-start gap-2 rounded-xl
              border border-red-200 bg-red-50
              p-4 text-sm text-red-700
              dark:border-red-400/20
              dark:bg-red-500/10
              dark:text-red-300
            "
          >
            <span>ⓘ</span>
            <p>{apiError}</p>
          </div>
        )}

        {/* FORM FIELDS */}
        <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">

          <Field label="Full name" error={errors.name?.message}>
            <input
              {...register("name")}
              type="text"
              autoComplete="name"
              className={fieldClass}
              placeholder="Your full name"
            />
          </Field>

          <Field label="Username" error={errors.username?.message}>
            <input
              {...register("username")}
              type="text"
              autoComplete="username"
              className={fieldClass}
              placeholder="your_username"
            />
          </Field>

          <Field label="Email address" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              className={fieldClass}
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Date of birth" error={errors.dateOfBirth?.message}>
            <input
              {...register("dateOfBirth")}
              type="date"
              className={fieldClass}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Gender" error={errors.gender?.message}>
              <select
                {...register("gender")}
                className={fieldClass}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>
          </div>

          <Field label="Password" error={errors.password?.message}>
            <input
              {...register("password")}
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              placeholder="Create a password"
            />
          </Field>

          <Field label="Confirm password" error={errors.rePassword?.message}>
            <input
              {...register("rePassword")}
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              placeholder="Confirm your password"
            />
          </Field>

        </div>

        {/* ACTIONS */}
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              group relative overflow-hidden rounded-2xl
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
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => {
              reset();
              setApiError("");
            }}
            className="
              rounded-2xl border border-[#D8C8FF]
              bg-white px-4 py-3.5
              font-semibold text-[#8050D5]
              transition-all duration-200
              hover:border-[#8B5CF6]
              hover:bg-[#F7F3FF]
              active:scale-[0.98]
              dark:border-[#51416F]
              dark:bg-[#25213A]
              dark:text-[#D5BEFF]
              dark:hover:bg-[#34294E]
            "
          >
            Reset
          </button>

        </div>

        {/* LOGIN LINK */}
        <p className="mt-7 text-center text-sm text-[#89859A] dark:text-[#AAA4BD]">
          Already registered?{" "}
          <Link
            to="/login"
            className="
              font-bold text-[#8B5CF6]
              transition-colors hover:text-[#6D28D9]
              dark:text-[#B69AFF]
              dark:hover:text-[#D5BEFF]
            "
          >
            Login
          </Link>
        </p>

      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-[#29243C] dark:text-[#E9E3F8]">
        {label}
      </span>

      {children}

      <span className="mt-1.5 block min-h-5 text-xs font-medium text-red-500 dark:text-red-400">
        {error}
      </span>
    </label>
  );
}
