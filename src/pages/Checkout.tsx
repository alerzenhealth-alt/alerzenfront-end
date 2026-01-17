import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface CartItem {
    id: string;
    name: string;
    price: number;
    type: "test" | "package";
}

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // User Details
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        sex: "male",
        phone: "",
        email: "",
        address: ""
    });

    // Promo Code
    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState<{ type: "percentage" | "flat", value: number } | null>(null);
    const [verifyingPromo, setVerifyingPromo] = useState(false);

    useEffect(() => {
        // Try to get from navigation state first (Buy Now)
        if (location.state?.item) {
            setCartItems([location.state.item]);
        }
    }, [location, navigate]);

    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

    const calculateTotal = () => {
        if (!discount) return subtotal;
        if (discount.type === "percentage") {
            return subtotal - (subtotal * discount.value / 100);
        }
        return Math.max(0, subtotal - discount.value);
    };

    const total = calculateTotal();

    const handleVerifyPromo = async () => {
        if (!promoCode) return;
        setVerifyingPromo(true);
        try {
            const { data, error } = await supabase
                .from('promo_codes')
                .select('*')
                .eq('code', promoCode.toUpperCase())
                .single();

            if (error || !data) {
                setDiscount(null);
                toast.error("Invalid promo code");
                return;
            }

            if (data.active === false) {
                toast.error("Promo code is inactive");
                return;
            }

            if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
                toast.error("Promo code has expired");
                return;
            }

            if (data.usageLimit !== null && (data.usageCount || 0) >= data.usageLimit) {
                toast.error("Promo code usage limit reached");
                return;
            }

            setDiscount({ type: data.discountType as "percentage" | "flat", value: data.discountValue });
            toast.success("Promo code applied!");

        } catch (error) {
            console.error("Promo error:", error);
            toast.error("Failed to verify promo code");
        } finally {
            setVerifyingPromo(false);
        }
    };

    const handleCompleteOrder = () => {
        if (!formData.name || !formData.phone) {
            toast.error("Please fill in required details");
            return;
        }

        const message = `
*New Order Request*
------------------
*Customer Details:*
Name: ${formData.name}
Age: ${formData.age}
Sex: ${formData.sex}
Phone: ${formData.phone}
Address: ${formData.address}

*Order Items:*
${cartItems.map(item => `- ${item.name} (₹${item.price})`).join("\n")}

*Payment Summary:*
Subtotal: ₹${subtotal}
Discount: ${discount ? (discount.type === "percentage" ? `${discount.value}%` : `₹${discount.value}`) : "None"}
*Total Payable: ₹${total}*
------------------
Please confirm my booking.
        `.trim();

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/919108009823?text=${encodedMessage}`, "_blank");
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: User Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Patient Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name *</Label>
                                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone Number *</Label>
                                        <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 99864 04073" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Age</Label>
                                        <Input value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} placeholder="e.g., 25" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sex</Label>
                                        <RadioGroup defaultValue="male" onValueChange={v => setFormData({ ...formData, sex: v })} className="flex gap-4 mt-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="male" id="male" />
                                                <Label htmlFor="male">Male</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="female" id="female" />
                                                <Label htmlFor="female">Female</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email (Optional)</Label>
                                    <Input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Address (for Home Collection)</Label>
                                    <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Full address with pincode" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {cartItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="truncate pr-4">{item.name}</span>
                                            <span className="font-medium">₹{item.price}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal}</span>
                                    </div>
                                    {discount && (
                                        <div className="flex justify-between text-sm text-green-600 font-medium">
                                            <span>Discount ({promoCode})</span>
                                            <span>- ₹{subtotal - total}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-2">
                                        <span>Total</span>
                                        <span>₹{total}</span>
                                    </div>
                                </div>

                                {/* Promo Code Input */}
                                <div className="pt-4">
                                    <Label className="text-xs mb-1.5 block">Have a promo code?</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={promoCode}
                                            onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder="Enter code"
                                            className="uppercase"
                                        />
                                        <Button variant="outline" onClick={handleVerifyPromo} disabled={verifyingPromo || !promoCode}>
                                            {verifyingPromo ? "..." : "Apply"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleCompleteOrder}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Order via WhatsApp
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Checkout;
