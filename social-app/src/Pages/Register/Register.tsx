import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

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
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { name: "", username: "", email: "", dateOfBirth: "", gender: "male", password: "", rePassword: "" },
  });

  if (token) return <Navigate to="/posts" replace />;

  const onSubmit = async (values: RegisterForm) => {
    setApiError("");
    try {
      await registerUser(values);
      navigate("/posts");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Registration failed");
    }
  };

  const fieldClass = "vybe-input w-full rounded-2xl border border-violet-100 bg-[#F7F5FF] px-4 py-3.5 outline-none focus:border-[#8B5CF6]";

  return (
    <div className="vybe-auth min-h-[calc(100vh-80px)] flex items-center justify-center py-10">
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="vybe-auth-card w-full max-w-2xl rounded-[2rem] border border-violet-100 bg-white p-7 shadow-[0_24px_80px_rgba(68,46,125,.12)] sm:p-10"
    >
      <div className="mb-8 text-center"><span className="vybe-pill">✨ Your community starts here</span><h1 className="mt-4 text-3xl font-black tracking-tight text-[#18152C] sm:text-4xl">Create your <span className="text-[#8B5CF6]">VYBE</span> account</h1><p className="mt-3 text-sm text-[#89859A]">Meet people, share moments, make connections.</p></div>

      {apiError && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {apiError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          <input
            {...register("name")}
            className={fieldClass}
            placeholder="Your full name"
          />
        </Field>

        <Field label="Username" error={errors.username?.message}>
          <input
            {...register("username")}
            className={fieldClass}
            placeholder="your_username"
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
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

        <Field label="Gender" error={errors.gender?.message}>
          <select {...register("gender")} className={fieldClass}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>

        <div />

        <Field label="Password" error={errors.password?.message}>
          <input
            {...register("password")}
            type="password"
            className={fieldClass}
            autoComplete="new-password"
          />
        </Field>

        <Field label="Confirm password" error={errors.rePassword?.message}>
          <input
            {...register("rePassword")}
            type="password"
            className={fieldClass}
            autoComplete="new-password"
          />
        </Field>
      </div>

      <div className="mt-5 grid gap-2 md:grid-cols-2">
        <button
          disabled={isSubmitting}
          className="vybe-primary rounded-2xl bg-[#8B5CF6] px-4 py-3.5 font-bold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Register"}
        </button>

        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl border border-[#8B5CF6] px-4 py-3 font-semibold text-[#8B5CF6]"
        >
          Reset
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already registered?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#8B5CF6]"
        >
          Login
        </Link>
      </p>
    </form>
  </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-sm font-medium">{label}</span>{children}<span className="mt-1 block min-h-5 text-sm text-red-500">{error}</span></label>;
}
