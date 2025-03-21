import { AdminFeatures } from "@/components/landing/admin-features";
import { CtaSection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/hero-section";
import { InterfaceShowcase } from "@/components/landing/interface-showcase";
import { SecuritySection } from "@/components/landing/security-section";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <FeaturesSection/>
        <InterfaceShowcase />
        <AdminFeatures />
        <SecuritySection />
        <CtaSection />
      </main>
      <Footer />

    </div>
  );
}
