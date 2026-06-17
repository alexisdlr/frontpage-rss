import Link from "next/link";

import { SignUpForm } from "@/src/components/auth/auth-forms";

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-text-primary">
        Create account
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Save your feeds, categories, and read state across devices.
      </p>
      <div className="mt-6">
        <SignUpForm />
      </div>
      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
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
