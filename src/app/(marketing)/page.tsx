import Hero from "@/src/components/marketing/hero";
import { MarketingCta } from "@/src/components/marketing/marketing-cta";
import { MarketingFeatures } from "@/src/components/marketing/marketing-features";
import { MarketingFooter } from "@/src/components/marketing/marketing-footer";
import { MarketingHowItWorks } from "@/src/components/marketing/marketing-how-it-works";
import Header from "@/src/components/shared/header";

export default function MarketingPage() {
  return (
    <div className="min-h-dvh bg-bg-primary">
      <Header />

      <main>
        <Hero />
        <MarketingFeatures />
        <MarketingHowItWorks />
        <MarketingCta />
      </main>

      <MarketingFooter />
    </div>
  );
}
