import { Metadata } from "next";
import SignUpContent from "@/src/components/auth/signup-content";
export const metadata: Metadata = {
  title: "Signup",
  description: "Create an account",
};

export default function SignupPage() {
  return <SignUpContent />;
}
