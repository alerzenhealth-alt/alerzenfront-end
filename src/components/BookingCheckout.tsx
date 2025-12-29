import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageCircle, Tag } from "lucide-react";
import { openWhatsApp } from "@/lib/whatsapp";

interface LabTest {
    id: string;
    name: string;
    price: number;
}

interface BookingCheckoutProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cart: LabTest[];
    onConfirm?: () => void;
    autoPromoCode?: string;
}

const BookingCheckout = ({ open, onOpenChange, cart, onConfirm, autoPromoCode }: BookingCheckoutProps) => {
    const [localCart, setLocalCart] = useState<LabTest[]>(cart);

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        sex: "",
        phone: "",
    });
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);
    const [promoError, setPromoError] = useState("");
    const [appliedPromo, setAppliedPromo] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        setLocalCart(cart);
    }, [cart]);

    // Auto-apply promo code when dialog opens
    useEffect(() => {
        if (open && autoPromoCode) {
            setPromoCode(autoPromoCode);
            validatePromoCode(autoPromoCode);
        } else if (open) {
            // Reset states when opening without auto code
            setPromoCode("");
            setDiscount(0);
            setAppliedPromo("");
            setPromoError("");
        }
    }, [open, autoPromoCode]);

    const subtotal = localCart.reduce((sum, item) => sum + item.price, 0);
    const total = Math.max(0, subtotal - discount);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };





    const validatePromoCode = async (codeToValidate?: string) => {
        const code = codeToValidate || promoCode;
        if (!code.trim()) return;

        setIsValidatingPromo(true);
        setPromoError("");
        setDiscount(0);
        setAppliedPromo("");

        try {
            const { data, error } = await supabase
                .from('promo_codes')
                .select('*')
                .eq('code', code.toUpperCase())
                .single();

            if (error || !data) {
                setPromoError("Invalid promo code");
                return;
            }

            const now = new Date();
            if (!data.active) {
                setPromoError("Promo code is inactive");
                return;
            }

            if (data.expiryDate && new Date(data.expiryDate) < now) {
                setPromoError("Promo code has expired");
                return;
            }

            if (data.usageLimit !== null && (data.usageCount || 0) >= data.usageLimit) {
                setPromoError("Promo code usage limit reached");
                return;
            }

            if (data.min_order_value && subtotal < data.min_order_value) {
                setPromoError(`Order must be at least ₹${data.min_order_value} to use this code`);
                return;
            }

            // Calculate discount
            let calculatedDiscount = 0;
            if (data.discountType === 'percentage') {
                calculatedDiscount = (subtotal * Number(data.discountValue)) / 100;
            } else {
                calculatedDiscount = Number(data.discountValue);
            }

            // Ensure discount doesn't exceed subtotal
            calculatedDiscount = Math.min(calculatedDiscount, subtotal);

            setDiscount(calculatedDiscount);
            setAppliedPromo(data.code);
            toast({
                title: "Promo code applied",
                description: `You saved ₹${Math.round(calculatedDiscount)}!`,
            });
        } catch (err) {
            console.error("Error validating promo:", err);
            setPromoError("Error checking promo code");
        } finally {
            setIsValidatingPromo(false);
        }
    };

    const handleBook = () => {
        // Basic validation
        if (!formData.name || !formData.age || !formData.sex || !formData.phone) {
            toast({
                title: "Missing details",
                description: "Please fill in all your details to proceed.",
                variant: "destructive",
            });
            return;
        }

        const testList = cart.map((t, i) => `${i + 1}. ${t.name} (₹${t.price})`).join("\n");

        const message = `*New Booking Request*
    
*Patient Details:*
Name: ${formData.name}
Age: ${formData.age}
Sex: ${formData.sex}
Phone: ${formData.phone}

*Tests Selected:*
${testList}

*Payment Summary:*
Subtotal: ₹${subtotal}
Discount ${appliedPromo ? `(${appliedPromo})` : ""}: -₹${Math.round(discount)}
*Total Amount: ₹${Math.round(total)}*

Please schedule my home sample collection.`;

        openWhatsApp(message);
        if (onConfirm) onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md glass-card border-white/50 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Checkout & Book</DialogTitle>
                    <DialogDescription>
                        Enter your details to finalize your booking on WhatsApp.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="glass bg-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="9876543210"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="glass bg-white/50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input
                                id="age"
                                name="age"
                                placeholder="25"
                                type="number"
                                value={formData.age}
                                onChange={handleInputChange}
                                className="glass bg-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sex">Sex</Label>
                            <select
                                id="sex"
                                name="sex"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 glass bg-white/50"
                                value={formData.sex}
                                onChange={handleInputChange}
                            >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-200/50">
                        <Label>Promo Code (Optional)</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter code"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                className="glass bg-white/50 uppercase"
                            />
                            <Button
                                variant="outline"
                                onClick={() => validatePromoCode()}
                                disabled={isValidatingPromo || !promoCode}
                                className="border-primary text-primary hover:bg-primary/10"
                            >
                                {isValidatingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                            </Button>
                        </div>
                        {promoError && <p className="text-xs text-red-500">{promoError}</p>}
                        {appliedPromo && <p className="text-xs text-green-600 flex items-center gap-1"><Tag className="w-3 h-3" /> {appliedPromo} applied</p>}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-200/50">
                        <h4 className="font-semibold text-sm text-gray-700">Order Summary</h4>
                        <div className="text-sm text-gray-500 space-y-1 max-h-32 overflow-y-auto">
                            {localCart.map((item, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span className="truncate pr-4">{item.name}</span>
                                    <span>₹{item.price}</span>
                                </div>
                            ))}
                        </div>



                        <div className="pt-2 mt-2 border-t border-gray-200/50 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                    <span>Discount</span>
                                    <span>-₹{Math.round(discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg text-primary pt-1">
                                <span>Total</span>
                                <span>₹{Math.round(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-11"
                        onClick={handleBook}
                    >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Confirmed & Book on WhatsApp
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BookingCheckout;
