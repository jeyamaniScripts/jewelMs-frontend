import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Create account | Ashira Jewels Admin" };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-h2">Create your account</h1>
      <p className="mt-2 text-body text-ink-muted">
        This one-time registration creates the platform&apos;s Super Admin. Jewelry brands and
        showroom staff are added later from inside the dashboard.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}
