import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in | Ashira Jewels Admin" };

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-h2">Welcome back</h1>
      <p className="mt-2 text-body text-ink-muted">Sign in to manage your jewelry business.</p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
