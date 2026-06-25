import { redirect } from "next/navigation";

import {
  getStarterCategories,
  getUserFeedCount,
} from "@/src/actions/onboarding";
import { OnboardingForm } from "@/src/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const [feedCountResult, categoriesResult] = await Promise.all([
    getUserFeedCount(),
    getStarterCategories(),
  ]);

  if (feedCountResult.ok && feedCountResult.data > 0) {
    redirect("/dashboard");
  }

  if (!categoriesResult.ok) {
    return (
      <div className="w-full max-w-2xl rounded-lg border border-border bg-surface px-6 py-10 text-center">
        <p className="text-sm text-text-secondary">{categoriesResult.error}</p>
      </div>
    );
  }
  return (
    <div className="w-full max-w-2xl">
      <OnboardingForm categories={categoriesResult.data} />
    </div>
  );
}
