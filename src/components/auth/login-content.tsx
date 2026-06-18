"use client";
import Link from "next/link";
import React from "react";
import { LoginForm } from "./auth-forms";
import { motion } from "framer-motion";
const LoginContent = ({ redirectTo }: { redirectTo?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-sm"
    >
      <h1 className="text-xl font-semibold text-text-primary">Sign in</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Welcome back. Sign in to access your feeds.
      </p>
      <div className="mt-6">
        <LoginForm redirectTo={redirectTo} />
      </div>
      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-accent hover:text-accent-hover"
        >
          Sign up
        </Link>
      </p>
    </motion.div>
  );
};

export default LoginContent;
