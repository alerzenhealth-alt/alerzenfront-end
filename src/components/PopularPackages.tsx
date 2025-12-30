import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, TestTube, CheckCircle, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BookingCheckout from "@/components/BookingCheckout";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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

const PopularPackages = () => {
    const [packages, setPackages] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState<LabTest | null>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [detailsPackage, setDetailsPackage] = useState<LabTest | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: promoData } = await supabase.from('promo_codes').select('*').eq('active', true);
                const { data: testData, error } = await supabase.from('tests').select('*').ilike('category', '%Package%').order('price', { ascending: true });

                if (error) throw error;

                if (testData) {
                    const formattedPackages: LabTest[] = testData.map(test => {
                        const sellingPrice = Number(test.price);
                        const originalPrice = test.originalPrice ? Number(test.originalPrice) : undefined;
                        let afterPromoPrice: number | undefined = undefined;

                        if (test.apply_promo_to_display_price && test.promo_code && promoData) {
                            const promo = promoData.find(p => p.code === test.promo_code);
                            if (promo) {
                                let discountAmount = 0;
                                if (promo.discountType === 'percentage') {
                                    discountAmount = (sellingPrice * promo.discountValue) / 100;
                                } else {
                                    discountAmount = promo.discountValue;
                                }
                                if (!promo.min_order_value || sellingPrice >= promo.min_order_value) {
                                    afterPromoPrice = Math.max(0, sellingPrice - discountAmount);
                                }
                            }
                        }

                        return {
                            id: test.id,
                            name: test.name,
                            category: test.category || "Package",
                            price: Math.round(sellingPrice),
                            originalPrice: originalPrice ? Math.round(originalPrice) : undefined,
                            deliveryTime: test.deliveryTime || "24 hrs",
                            description: test.description || "",
                            popular: test.popular || false,
                            promo_code: test.promo_code || undefined,
                            afterPromoPrice: afterPromoPrice ? Math.round(afterPromoPrice) : undefined
                        };
                    });
                    setPackages(formattedPackages);
                }
            } catch (error) {
                console.error("Failed to fetch packages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleBookNow = (pkg: LabTest) => {
        // Pass standard selling price to checkout to allow promo code logic to run normally there
        setSelectedPackage(pkg);
        setIsCheckoutOpen(true);
    };

    const handleViewDetails = (pkg: LabTest) => {
        setDetailsPackage(pkg);
        setIsDetailsOpen(true);
    };

    if (loading) return null;
    if (packages.length === 0) return null;

    return (
        <section className="py-20 bg-transparent relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 space-y-4 relative">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[#0b3c65] tracking-tight drop-shadow-sm">
                        Popular <span className="text-[#be2c2d]">Health Packages</span>
                    </h2>
                    <p className="text-lg text-[#0b3c65]/80 max-w-2xl mx-auto font-medium">
                        Comprehensive full body checkups curated by top doctors at unbeatable prices.
                    </p>
                    <div className="absolute top-0 right-0 hidden md:block">
                        <a href="/health-packages" className="text-[#be2c2d] font-bold hover:underline flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>
                    {/* Mobile View All centered below */}
                    <div className="md:hidden pt-2">
                        <a href="/health-packages" className="text-[#be2c2d] font-bold hover:underline inline-flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                <Carousel opts={{ align: "start" }} className="w-full">
                    <CarouselContent className="-ml-4 pb-10 pt-4">
                        {packages.map((pkg) => (
                            <CarouselItem key={pkg.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
                                <Card className="h-full flex flex-col border border-white/60 shadow-xl hover:shadow-2xl hover:shadow-[#be2c2d]/10 transition-all duration-500 group hover:-translate-y-3 bg-gradient-to-br from-white/90 to-[#be2c2d]/5 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
                                    <CardHeader className="p-8 pb-4 relative">
                                        {/* Floating Badge Calculation: Use biggest diff */}
                                        {pkg.afterPromoPrice ? (
                                            pkg.originalPrice && (
                                                <div className="absolute top-6 right-6 bg-[#be2c2d] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[#be2c2d]/30 z-10 animate-pulse">
                                                    {Math.round(((pkg.originalPrice - pkg.afterPromoPrice) / pkg.originalPrice) * 100)}% DETOX
                                                </div>
                                            )
                                        ) : (
                                            pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                <div className="absolute top-6 right-6 bg-[#be2c2d] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[#be2c2d]/30 z-10 animate-pulse">
                                                    {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}% OFF
                                                </div>
                                            )
                                        )}

                                        <div className="flex items-start justify-between mb-4">
                                            <Badge className="bg-[#0b3c65]/10 text-[#0b3c65] border-[#0b3c65]/20 px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-sm">
                                                {pkg.category}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-2xl font-black text-[#0b3c65] leading-tight min-h-[4rem] flex items-center group-hover:text-[#be2c2d] transition-colors">
                                            {pkg.name}
                                        </CardTitle>
                                        <CardDescription className="text-base text-gray-600 font-medium line-clamp-2 mt-3 min-h-[3rem]">
                                            {pkg.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="p-8 pt-0 space-y-6 flex-1">
                                        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#be2c2d]/20 to-transparent my-2" />
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-[#0b3c65] bg-white/60 px-4 py-2 rounded-2xl border border-white/80 shadow-sm">
                                                <Clock className="w-4 h-4 text-[#be2c2d]" /> {pkg.deliveryTime}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-[#0b3c65] bg-white/60 px-4 py-2 rounded-2xl border border-white/80 shadow-sm">
                                                <TestTube className="w-4 h-4 text-[#be2c2d]" /> Home Sample
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-8 pt-6 mt-auto flex items-center justify-between bg-white/40 backdrop-blur-sm border-t border-white/50">
                                        <div>
                                            {/* Triple Price Logic */}
                                            {pkg.afterPromoPrice ? (
                                                <div className="flex flex-col">
                                                    {/* Row 1: Original + Selling (Both struck/muted) */}
                                                    <div className="flex items-baseline gap-2 mb-1">
                                                        {pkg.originalPrice && (
                                                            <span className="text-xs font-bold text-gray-400 line-through">₹{pkg.originalPrice}</span>
                                                        )}
                                                        <span className="text-sm font-bold text-gray-500 line-through decoration-red-500/50">₹{pkg.price}</span>
                                                    </div>

                                                    {/* Row 2: Final Promo Price */}
                                                    <div className="text-3xl font-extrabold text-[#be2c2d] drop-shadow-sm">₹{pkg.afterPromoPrice}</div>

                                                    {/* Row 3: Tag */}
                                                    <p className="text-[10px] text-green-600 font-black mt-1 uppercase tracking-wider flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
                                                        With {pkg.promo_code}
                                                    </p>
                                                </div>
                                            ) : (
                                                // Standard Double Price Logic
                                                <div>
                                                    {pkg.originalPrice && (
                                                        <div className="text-sm font-bold text-gray-400 line-through mb-1">₹{pkg.originalPrice}</div>
                                                    )}
                                                    <div className="text-3xl font-extrabold text-[#be2c2d] drop-shadow-sm">₹{pkg.price}</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-12 w-12 rounded-2xl border-2 border-[#0b3c65]/10 hover:border-[#be2c2d] hover:text-[#be2c2d] hover:bg-white text-[#0b3c65] transition-colors"
                                                onClick={() => handleViewDetails(pkg)}
                                            >
                                                <Info className="w-6 h-6" />
                                            </Button>
                                            <Button
                                                className="h-12 px-8 bg-[#be2c2d] hover:bg-[#be2c2d]/90 text-white font-bold rounded-2xl shadow-lg shadow-[#be2c2d]/20 hover:shadow-[#be2c2d]/40 hover:scale-105 transition-all duration-300"
                                                onClick={() => handleBookNow(pkg)}
                                            >
                                                Book Now
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="flex -left-4 md:-left-12 h-10 w-10 md:h-14 md:w-14 rounded-full border-none bg-white/80 text-[#0b3c65] shadow-xl hover:bg-white hover:scale-110 transition-all hover:text-[#be2c2d] z-20" />
                    <CarouselNext className="flex -right-4 md:-right-12 h-10 w-10 md:h-14 md:w-14 rounded-full border-none bg-white/80 text-[#0b3c65] shadow-xl hover:bg-white hover:scale-110 transition-all hover:text-[#be2c2d] z-20" />
                </Carousel>

                {/* Test Details Dialog */}
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-2xl border-white/50 shadow-2xl rounded-3xl p-0 overflow-hidden">
                        <div className="p-6 bg-gradient-to-br from-[#be2c2d]/5 to-transparent">
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-4">
                                    <Badge className="bg-[#0b3c65] text-white border-none py-1.5 px-3 rounded-full">{detailsPackage?.category}</Badge>
                                </div>
                                <DialogTitle className="text-3xl font-black text-[#0b3c65]">{detailsPackage?.name}</DialogTitle>
                                <DialogDescription className="text-lg text-gray-600 pt-3 leading-relaxed">
                                    {(() => {
                                        const desc = detailsPackage?.description || "";
                                        if (desc.includes("Includes:")) {
                                            const parts = desc.split("Includes:");
                                            const mainDesc = parts[0].trim();
                                            const tests = parts[1].split(",").map(t => t.trim());
                                            return (
                                                <div className="space-y-4">
                                                    <p>{mainDesc.endsWith(".") ? mainDesc : `${mainDesc}.`}</p>
                                                    <div className="bg-white/50 rounded-xl p-4 border border-[#0b3c65]/10">
                                                        <h4 className="font-bold text-[#0b3c65] text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
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
                        </div>

                        <div className="p-6 space-y-6 pt-0">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#0b3c65]/5 p-4 rounded-2xl border border-[#0b3c65]/10">
                                    <div className="flex items-center gap-2 mb-2 text-[#0b3c65] font-bold">
                                        <Clock className="w-4 h-4" /> Report Time
                                    </div>
                                    <p className="text-gray-700 font-medium">{detailsPackage?.deliveryTime}</p>
                                </div>
                                <div className="bg-[#be2c2d]/5 p-4 rounded-2xl border border-[#be2c2d]/10">
                                    <div className="flex items-center gap-2 mb-2 text-[#be2c2d] font-bold">
                                        <CheckCircle className="w-4 h-4" /> Accuracy
                                    </div>
                                    <p className="text-gray-700 font-medium">100% Verified</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl font-black text-[#be2c2d]">₹{detailsPackage?.price}</span>
                                        {detailsPackage?.originalPrice && (
                                            <span className="text-lg text-gray-400 line-through font-semibold">₹{detailsPackage.originalPrice}</span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    className="h-14 px-8 bg-[#be2c2d] hover:bg-[#be2c2d]/90 text-white shadow-xl shadow-[#be2c2d]/25 rounded-2xl font-bold text-lg"
                                    onClick={() => {
                                        if (detailsPackage) {
                                            setIsDetailsOpen(false);
                                            handleBookNow(detailsPackage);
                                        }
                                    }}
                                >
                                    Proceed
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <BookingCheckout
                    open={isCheckoutOpen}
                    onOpenChange={setIsCheckoutOpen}
                    cart={selectedPackage ? [selectedPackage] : []}
                    onConfirm={() => setSelectedPackage(null)}
                    autoPromoCode={selectedPackage?.promo_code}
                />
            </div>
        </section>
    );
};

export default PopularPackages;
