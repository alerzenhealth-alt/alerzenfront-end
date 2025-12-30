import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import heroImage from "@/assets/hero-phlebotomist-real.png";
import familyImage from "@/assets/indian-family.png";
import labImage from "@/assets/lab-equipment.png";
import { HeroBanner } from "./HeroBanner";
import HeroSearchBar from "./HeroSearchBar";
import { openWhatsApp } from "@/lib/whatsapp";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { HeroSpotlight } from "./HeroSpotlight";

const Hero = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);
  const images = [heroImage, familyImage, labImage];

  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content - Order 2 on mobile, Order 1 on desktop */}
          <div className="order-2 lg:order-1 text-center lg:text-left space-y-6 lg:space-y-8 z-10">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
              The fastest way to get a <span className="text-primary">lab test</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Home sample collection in 60 minutes. Reports in 6 hours. Experience the future of diagnostics.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto lg:mx-0">
              <HeroBanner />
              <HeroSearchBar />
            </div>

            {/* Features / Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-8 pt-2 sm:pt-4">
              <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-700 font-medium">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
                60 min collection
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-700 font-medium">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
                6 AM - 10 PM
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-gray-700 font-medium">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></div>
                NABL Labs
              </div>
            </div>
            {/* Mobile Spotlight Card */}
            <div className="block lg:hidden mt-8">
              <HeroSpotlight className="w-full" />
            </div>
          </div>

          {/* Hero Carousel - Order 1 on mobile, Order 2 on desktop */}
          <div className="order-1 lg:order-2 relative w-full aspect-[4/3] lg:aspect-square max-h-[400px] lg:max-h-[600px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-3xl transform rotate-3 z-0"></div>
            <div className="relative z-10 overflow-hidden rounded-3xl shadow-2xl h-full w-full" ref={emblaRef}>
              <div className="flex h-full">
                {images.map((src, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
                    <img
                      src={src}
                      alt={`Slide ${index + 1}`}
                      className="block h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Spotlight Card */}
            <div className="hidden lg:block">
              <HeroSpotlight className="absolute -bottom-6 -left-6 w-[320px]" />
            </div>
          </div>
        </div>


      </div>
    </section>
  );
};

export default Hero;
