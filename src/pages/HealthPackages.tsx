import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, CheckCircle, Clock, TestTube, Info, ArrowRight, ShieldCheck, Activity } from "lucide-react";
import primaLogo from "@/assets/prima_logo.png";
import { openWhatsApp } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import BookingCheckout from "@/components/BookingCheckout";

interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  deliveryTime: string;
  description?: string;
  popular?: boolean;
  promo_code?: string;
  apply_promo_to_display_price?: boolean;
  promoApplied?: boolean;
}

const HealthPackages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allTests, setAllTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsTest, setDetailsTest] = useState<LabTest | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch promo codes
        const { data: promoData } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('active', true);

        // Fetch packages
        const { data: testData, error } = await supabase
          .from('tests')
          .select('*')
          .eq('category', 'Package') // Filter ONLY Packages
          .order('popular', { ascending: false }) // Prioritize popular tests
          .order('name');

        if (error) {
          console.error('Error fetching tests:', error);
          return;
        }

        if (testData) {
          const formattedTests: LabTest[] = testData.map(test => {
            let finalPrice = Number(test.price);
            let finalOriginalPrice = test.originalPrice ? Number(test.originalPrice) : undefined;
            let isPromoApplied = false;

            if (test.apply_promo_to_display_price && test.promo_code && promoData) {
              const promo = promoData.find(p => p.code === test.promo_code);
              if (promo) {
                let discountAmount = 0;
                if (promo.discountType === 'percentage') {
                  discountAmount = (finalPrice * promo.discountValue) / 100;
                } else {
                  discountAmount = promo.discountValue;
                }

                if (!promo.min_order_value || finalPrice >= promo.min_order_value) {
                  finalOriginalPrice = finalPrice;
                  finalPrice = Math.max(0, finalPrice - discountAmount);
                  isPromoApplied = true;
                }
              }
            }

            return {
              id: test.id,
              name: test.name,
              category: test.category || "General",
              price: Math.round(finalPrice),
              originalPrice: finalOriginalPrice ? Math.round(finalOriginalPrice) : undefined,
              deliveryTime: test.deliveryTime || "24-48 hours",
              description: test.description || "",
              popular: test.popular || false,
              promo_code: test.promo_code || undefined,
              promoApplied: isPromoApplied
            };
          });
          setAllTests(formattedTests);
        }
      } catch (err) {
        console.error('Unexpected error fetching tests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTests = allTests.filter(test =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    test.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularTests = allTests.filter(test => test.popular).slice(0, 6);

  const handleBookNow = (test: LabTest) => {
    let bookingTest = { ...test };
    // If promo was applied for display, the 'price' is already discounted.
    // We need to revert to the pre-discount price (stored in originalPrice during our mapping)
    // so that BookingCheckout can apply the discount calculation correctly without double-dipping.
    if (test.promoApplied && test.originalPrice) {
      bookingTest.price = test.originalPrice;
    }
    setSelectedTest(bookingTest);
    setIsCheckoutOpen(true);
  };

  const handleViewDetails = (test: LabTest) => {
    setDetailsTest(test);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background glass-bg-pattern medical-pattern text-foreground font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-transparent relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Partner Logo */}
          <div className="absolute top-0 right-4 md:right-8 animate-fade-in opacity-90 hover:opacity-100 transition-opacity">
            <img src={primaLogo} alt="Powered by Prima Diagnostics" className="h-12 md:h-16 w-auto drop-shadow-sm" />
          </div>

          <div className="text-center space-y-6 mb-12 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-primary drop-shadow-sm tracking-tight">
              Health Packages
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed">
              Comprehensive diagnostic tests tailored for you. <br className="hidden sm:block" />
              <span className="text-primary font-semibold">Fast reports. Accurate results. Home collection.</span>
            </p>

            {/* Search Bar - Enhanced */}
            <div className="max-w-2xl mx-auto mt-10 transform hover:scale-[1.01] transition-transform duration-300">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary w-6 h-6 z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
                <Input
                  type="text"
                  placeholder="Find your test (e.g. Full Body, Vitamin D, CBC)..."
                  className="pl-16 pr-6 py-8 text-lg rounded-2xl glass border-white/60 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-xl hover:shadow-2xl transition-all placeholder:text-gray-500 text-gray-800 backdrop-blur-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats - Enhanced Glass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {[
              { icon: Clock, title: "Same Day Reports", desc: "Results in 4-8 hours" },
              { icon: ShieldCheck, title: "NABL Certified", desc: "100% Accurate & Safe" },
              { icon: Activity, title: "Expert Support", desc: "Consultation available" }
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center hover:-translate-y-2 transition-transform duration-300 border-t border-white/80">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{stat.title}</h3>
                <p className="text-sm text-gray-600 font-medium">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tests - Carousel Layout */}
      {searchQuery === "" && (
        <section className="py-12 md:py-20 bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                  <span className="text-primary">Trending</span> Packages
                </h2>
                <p className="text-lg text-gray-600 font-medium">Most booked health checkups this week</p>
              </div>
              <Button variant="ghost" className="hidden sm:flex text-primary hover:bg-primary/5 font-semibold gap-2" onClick={() => setSearchQuery(' ')}>
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {popularTests.map((test, index) => (
                  <Card
                    key={index}
                    className="glass-card border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden group hover:-translate-y-2 flex flex-col h-full bg-gradient-to-br from-white/90 to-white/40"
                  >
                    <CardHeader className="p-6 pb-2 relative">
                      {/* Discount Badge */}
                      {test.originalPrice && test.originalPrice > test.price && (
                        <div className="absolute top-6 right-6 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse">
                          {Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)}% OFF
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className="bg-blue-50/90 text-blue-700 border-blue-100 font-semibold px-3 py-1">
                          {test.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors min-h-[3.5rem] flex items-center">
                        {test.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 font-medium line-clamp-2 mt-2 min-h-[2.5rem]">
                        {test.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-2 space-y-5 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-white/60 px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{test.deliveryTime} Report</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-white/60 px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                          <TestTube className="w-3.5 h-3.5 text-accent" />
                          <span>Home Collection</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 pt-0 mt-auto flex items-center justify-between border-t border-white/50 bg-white/30 backdrop-blur-sm">
                      <div>
                        {test.originalPrice && (
                          <div className="text-sm font-semibold text-gray-400 line-through">₹{test.originalPrice}</div>
                        )}
                        <div className="text-2xl font-extrabold text-primary">₹{test.price}</div>
                        {test.promoApplied && (
                          <p className="text-[10px] text-green-600 font-bold uppercase tracking-wide flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                            Promo Applied
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-white/80 border-primary/20 hover:bg-white hover:text-primary rounded-xl"
                          onClick={() => handleViewDetails(test)}
                          title="View Details"
                        >
                          <Info className="w-5 h-5" />
                        </Button>
                        <Button
                          className="bg-primary hover:bg-primary-light text-white font-bold rounded-xl px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105"
                          onClick={() => handleBookNow(test)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* All Tests Grid */}
      <section className="py-12 md:py-20 bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 border-l-4 border-primary pl-4">
              {searchQuery ? `Search Results (${filteredTests.length})` : "All Tests & Packages"}
            </h2>
          </div>

          {filteredTests.length === 0 && !loading ? (
            <div className="text-center py-20 glass-card rounded-3xl max-w-2xl mx-auto border-dashed border-2 border-gray-300">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">No matches found</h3>
              <p className="text-gray-500 mt-2">
                We couldn't find any test matching "{searchQuery}". <br />
                Try checking for typos or use broader keywords.
              </p>
              <Button
                variant="outline"
                className="mt-6 border-primary text-primary hover:bg-primary/5"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test, index) => (
                <Card
                  key={index}
                  className="glass-card border-white/50 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group hover:-translate-y-1 bg-white/60"
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-gray-600 border-gray-300 bg-transparent backdrop-blur-sm">
                        {test.category}
                      </Badge>
                      {test.popular && (
                        <Badge className="bg-gradient-to-r from-orange-400 to-orange-500 text-white border-none shadow-sm">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {test.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {test.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-4">
                    <div className="flex items-end justify-between pt-4 border-t border-gray-200/50 mt-4">
                      <div>
                        {test.originalPrice && (
                          <div className="text-xs font-semibold text-gray-400 line-through">₹{test.originalPrice}</div>
                        )}
                        <div className="text-xl font-bold text-gray-900">₹{test.price}</div>
                        {test.promoApplied && (
                          <p className="text-[10px] text-green-600 font-bold uppercase tracking-wide flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                            Promo Applied
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-primary hover:bg-primary/5"
                          onClick={() => handleViewDetails(test)}
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary-light text-white font-bold rounded-lg px-4"
                          onClick={() => handleBookNow(test)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Test Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg glass-card border-white/70 bg-white/90 backdrop-blur-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{detailsTest?.category}</Badge>
              {detailsTest?.popular && <Badge className="bg-orange-100 text-orange-600 border-orange-200">Popular</Badge>}
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">{detailsTest?.name}</DialogTitle>
            <DialogDescription className="text-base text-gray-600 pt-2">
              {(() => {
                const desc = detailsTest?.description || "Comprehensive diagnostic test covering key health parameters.";
                if (desc.includes("Includes:")) {
                  const parts = desc.split("Includes:");
                  const mainDesc = parts[0].trim();
                  const tests = parts[1].split(",").map(t => t.trim());
                  return (
                    <div className="space-y-4">
                      <p>{mainDesc.endsWith(".") ? mainDesc : `${mainDesc}.`}</p>
                      <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                        <h4 className="font-bold text-primary text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                          <TestTube className="w-4 h-4" /> Tests Included ({tests.length})
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {tests.map((test, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                              {test}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                }
                return desc;
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4 bg-white/50 p-4 rounded-xl border border-white/60 shadow-sm">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Turnaround Time</p>
                <p className="font-medium text-gray-900">{detailsTest?.deliveryTime}</p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/10">
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">₹{detailsTest?.price}</span>
                  {detailsTest?.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">₹{detailsTest.originalPrice}</span>
                  )}
                </div>
                {detailsTest?.promoApplied && (
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wide flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                    Promo Code Applied
                  </p>
                )}
              </div>
              <Button
                className="bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/25"
                onClick={() => {
                  if (detailsTest) {
                    setIsDetailsOpen(false);
                    handleBookNow(detailsTest);
                  }
                }}
              >
                Book Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Checkout Modal */}
      <BookingCheckout
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        cart={selectedTest ? [selectedTest] : []}
        onConfirm={() => {
          setSelectedTest(null);
          // Optional: Show success toast or redirect
        }}
        autoPromoCode={selectedTest?.promo_code}
      />

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-transparent relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="glass-card rounded-3xl p-12 max-w-4xl mx-auto shadow-2xl border border-white/60 bg-gradient-to-b from-white/80 to-white/40">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-6">
              Can't Find Your Test?
            </h2>
            <p className="text-xl text-gray-600 mb-8 font-medium">
              We offer 1000+ tests. Just text us your requirement.
            </p>
            <Button
              size="lg"
              className="mt-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-full px-10 h-14 text-lg shadow-green-200 hover:shadow-green-300 shadow-xl hover:-translate-y-1 transition-all"
              onClick={() => openWhatsApp("Hi, I need help finding a test")}
            >
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
};

export default HealthPackages;