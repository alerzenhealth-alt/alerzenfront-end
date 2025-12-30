
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import BookingCheckout from "@/components/BookingCheckout";

interface LabTest {
    id: string;
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    description?: string;
    popular?: boolean;
    promo_code?: string;
}

export const HeroSpotlight = ({ className = "" }: { className?: string }) => {
    const [deal, setDeal] = useState<LabTest | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    useEffect(() => {
        const fetchDeal = async () => {
            try {
                // Fetch the most attractive package (e.g., biggest discount or marked popular)
                const { data } = await supabase
                    .from('tests')
                    .select('*')
                    .eq('category', 'Package')
                    .eq('popular', true)
                    .limit(1)
                    .maybeSingle();

                if (data) {
                    setDeal({
                        id: data.id,
                        name: data.name,
                        category: data.category || "Package",
                        price: Number(data.price),
                        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
                        description: data.description || "",
                        promo_code: data.promo_code
                    });
                }
            } catch (error) {
                console.error("Error fetching spotlight deal:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeal();
    }, []);

    if (loading || !deal) return null;

    return (
        <>
            <div className={`animate-fade-in-up ${className}`}>
                {/* Glass Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-primary/10 rounded-3xl p-5 overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">

                    {/* Decorative Gradient Blob */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors" />

                    <div className="flex justify-between items-start mb-3 relative">
                        <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg shadow-red-500/30 px-3 py-1 text-xs font-bold animate-pulse">
                            <Sparkles className="w-3 h-3 mr-1 fill-white" />
                            Best Seller
                        </Badge>
                        {deal.originalPrice && (
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full border border-green-200">
                                SAVE {Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)}%
                            </span>
                        )}
                    </div>

                    <h3 className="text-lg font-black text-gray-900 leading-tight mb-1 relative">
                        {deal.name}
                    </h3>

                    <p className="text-xs text-gray-500 font-medium mb-4 line-clamp-2">
                        {deal.description?.split("Includes:")[0]}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Limited Offer</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-extrabold text-primary">₹{deal.price}</span>
                                {deal.originalPrice && (
                                    <span className="text-xs text-gray-400 line-through">₹{deal.originalPrice}</span>
                                )}
                            </div>
                        </div>
                        <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-4 shadow-lg shadow-primary/25 h-10 font-bold text-xs"
                            onClick={() => setIsCheckoutOpen(true)}
                        >
                            Book Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            <BookingCheckout
                open={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                cart={[deal]}
                onConfirm={() => setIsCheckoutOpen(false)}
                autoPromoCode={deal.promo_code}
            />
        </>
    );
};
