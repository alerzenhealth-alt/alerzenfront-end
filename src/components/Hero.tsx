import { Button } from "@/components/ui/button";
import { HeroBanner } from "./HeroBanner";
import HeroSearchBar from "./HeroSearchBar";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import heroImage from "@/assets/hero-phlebotomist-real.png";
import familyImage from "@/assets/indian-family.png";
import labImage from "@/assets/lab-equipment.png";

const Hero = () => {
  const navigate = useNavigate();
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [slides, setSlides] = useState<Array<{
    id: string;
    image: string;
    title: string;
    price: number;
    description: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  // Default fallback static images
  const defaultSlides = [
    {
      id: "default-1",
      image: heroImage,
      title: "Home Collection",
      price: 0,
      description: "Safe & hygienic sample collection"
    },
    {
      id: "default-2",
      image: familyImage,
      title: "Family Health",
      price: 0,
      description: "Complete care for your loved ones"
    },
    {
      id: "default-3",
      image: labImage,
      title: "Advanced Labs",
      price: 0,
      description: "NABL Accredited Partners"
    }
  ];

  useEffect(() => {
    fetchHeroPackages();
  }, []);

  const fetchHeroPackages = async () => {
    try {
      // Relaxed query to match "Package", "Health Package", "package" etc.
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .ilike('category', '%Package%')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Error fetching slides:", error);
      }

      if (data) {
        // Filter locally for image existence to be safe
        const validSlides = data
          .filter(pkg => (pkg as any).image_url)
          .map(pkg => ({
            id: pkg.id,
            image: (pkg as any).image_url,
            title: pkg.name,
            price: pkg.price || 0,
            description: pkg.description || ""
          }));

        if (validSlides.length > 0) {
          setSlides(validSlides);
        } else {
          // If no custom images, fallback
          setSlides(defaultSlides);
        }
      } else {
        setSlides(defaultSlides);
      }
    } catch (error) {
      console.error("Error fetching slides", error);
      setSlides(defaultSlides);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* LEFT COLUMN: Text & Search */}
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
          </div>

          {/* RIGHT COLUMN: Dynamic Carousel */}
          <div className="order-1 lg:order-2 relative w-full aspect-[4/3] lg:aspect-square max-h-[400px] lg:max-h-[600px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-3xl transform rotate-3 z-0"></div>

            <div className="relative z-10 overflow-hidden rounded-3xl shadow-2xl h-full w-full bg-gray-100" ref={emblaRef}>
              <div className="flex h-full">
                {slides.map((slide) => (
                  <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative h-full group">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="block h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Overlay Gradient & Text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10 text-white">
                      <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{slide.title}</h3>
                        {slide.price > 0 && (
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-xl md:text-2xl font-bold text-primary-foreground bg-primary/90 px-3 py-1 rounded-md">
                              ₹{slide.price}
                            </span>
                            {slide.description && (
                              <span className="text-sm md:text-base text-gray-200 line-clamp-1">{slide.description}</span>
                            )}
                          </div>
                        )}

                        {slide.price > 0 && (
                          <Button
                            onClick={() => navigate(`/package/${slide.id}`)}
                            className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 font-bold transition-all"
                          >
                            Book Now <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
