"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  requestPasswordReset,
  signIn,
  signUp,
  updatePassword,
  type AuthActionState,
} from "@/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

function FormMessage({ state }: { state: AuthActionState }) {
  if (state.error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{state.error}</AlertDescription>
      </Alert>
    );
  }

  if (state.success) {
    return (
      <Alert className="border-success/30 bg-success/10 text-success *:data-[slot=alert-description]:text-success">
        <AlertDescription>{state.success}</AlertDescription>
      </Alert>
    );
  }

  return null;
}

function AuthField({
  id,
  label,
  type = "text",
  autoComplete,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="min-h-11 bg-background px-3 py-2.5"
      />
    </div>
  );
}

function SubmitButton({
  label,
  pending,
}: {
  label: string;
  pending: boolean;
}) {
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="min-h-11 w-full"
    >
      {pending ? "Please wait…" : label}
    </Button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {redirectTo ? (
        <input type="hidden" name="redirect" value={redirectTo} />
      ) : null}
      <FormMessage state={state} />
      <AuthField id="email" label="Email" type="email" autoComplete="email" />
      <AuthField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
      />
      <SubmitButton label="Sign in" pending={pending} />
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/reset-password"
          className="font-medium text-primary hover:text-primary/80"
        >
          Forgot your password?
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage state={state} />
      <AuthField id="email" label="Email" type="email" autoComplete="email" />
      <AuthField
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
      />
      <AuthField
        id="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
      />
      <SubmitButton label="Create account" pending={pending} />
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage state={state} />
      <AuthField id="email" label="Email" type="email" autoComplete="email" />
      <SubmitButton label="Send reset link" pending={pending} />
    </form>
  );
}

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage state={state} />
      <AuthField
        id="password"
        label="New password"
        type="password"
        autoComplete="new-password"
      />
      <AuthField
        id="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
      />
      <SubmitButton label="Update password" pending={pending} />
    </form>
  );
}
