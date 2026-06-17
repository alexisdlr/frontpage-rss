import Link from "next/link";

import { ResetPasswordForm } from "@/src/components/auth/auth-forms";

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-text-primary">
        Reset password
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
      <div className="mt-6">
        <ResetPasswordForm />
      </div>
      <p className="mt-6 text-center text-sm text-text-secondary">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-accent hover:text-accent-hover"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
