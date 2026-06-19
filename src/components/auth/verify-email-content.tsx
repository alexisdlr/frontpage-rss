"use client";
import { motion } from "framer-motion";

const VerifyEmailContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-sm"
    >
      <h1 className="text-xl font-semibold text-text-primary">
        Verify your email
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        We've sent you an email to verify your email address.
      </p>
    </motion.div>
  );
};

export default VerifyEmailContent;
