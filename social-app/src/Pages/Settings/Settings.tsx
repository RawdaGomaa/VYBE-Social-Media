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
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", newPassword: "", rePassword: "" },
  });

  const submit = async (values: Form) => {
    setError("");
    setMessage("");
    try {
      // API contract only needs password + newPassword.
      await changePassword(values.password, values.newPassword);
      setMessage("Password changed successfully");
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not change password");
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl py-6">
      <form onSubmit={handleSubmit(submit)} className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="mb-5 text-2xl font-bold">Settings</h1>
        {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-red-600">{error}</div>}
        {message && <div className="mb-4 rounded-xl bg-green-50 p-3 text-green-700">{message}</div>}

        <Input label="Current password" error={errors.password?.message}>
          <input {...register("password")} type="password" autoComplete="current-password" className="w-full rounded-xl bg-gray-50 p-3 outline-none focus:ring-1 focus:ring-[#8B5CF6]" />
        </Input>
        <Input label="New password" error={errors.newPassword?.message}>
          <input {...register("newPassword")} type="password" autoComplete="new-password" className="w-full rounded-xl bg-gray-50 p-3 outline-none focus:ring-1 focus:ring-[#8B5CF6]" />
        </Input>
        <Input label="Confirm new password" error={errors.rePassword?.message}>
          <input {...register("rePassword")} type="password" autoComplete="new-password" className="w-full rounded-xl bg-gray-50 p-3 outline-none focus:ring-1 focus:ring-[#8B5CF6]" />
        </Input>

        <button disabled={isSubmitting} className="w-full rounded-xl bg-[#8B5CF6] p-3 font-semibold text-white disabled:opacity-60">
          {isSubmitting ? "Changing..." : "Change password"}
        </button>
      </form>

      <button onClick={logout} className="mt-4 w-full rounded-xl border border-red-300 bg-white p-3 font-semibold text-red-600">
        Logout
      </button>
    </div>
  );
}

function Input({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="mb-4 block"><span className="mb-1 block text-sm font-medium">{label}</span>{children}<span className="mt-1 block min-h-5 text-sm text-red-500">{error}</span></label>;
}
