import VerifyEmailContent from "@/src/components/auth/verify-email-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address",
};
const VerifyEmailPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <VerifyEmailContent />
    </div>
  );
};

export default VerifyEmailPage;
