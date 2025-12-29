import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProcessSteps from "@/components/ProcessSteps";
import Services from "@/components/Services";
import TrustSection from "@/components/TrustSection";
import Testimonials from "@/components/Testimonials";
import Gallery from "@/components/Gallery";
import ServiceArea from "@/components/ServiceArea";
import Footer from "@/components/Footer";


import PopularPackages from "@/components/PopularPackages";

import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import FAQ from "@/components/FAQ";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AnnouncementBanner />
      <Hero />
      <PopularPackages />
      <ProcessSteps />

      {/* Popular Tests Section - Integrated from HealthPackages */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Most Booked Checkups</h2>
          <a href="/health-packages" className="text-primary font-medium hover:underline">View All</a>
        </div>
        <Services />
      </div>

      <TrustSection />
      <Testimonials />
      <Testimonials />
      <FAQ />
      <Footer />

    </div>
  );
};

export default Index;
