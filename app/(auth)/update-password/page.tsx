import { UpdatePasswordForm } from "@/components/auth/auth-forms";

export default function UpdatePasswordPage() {
  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-text-primary">Set new password</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Choose a new password for your account.
      </p>
      <div className="mt-6">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
