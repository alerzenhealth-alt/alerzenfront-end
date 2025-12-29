import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, CheckCircle, Clock, TestTube, ArrowRight } from "lucide-react";
import { openWhatsApp } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import BookingCheckout from "@/components/BookingCheckout";
import { useNavigate } from "react-router-dom";

interface LabTest {
    id: string;
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    deliveryTime: string;
    description?: string;
    popular?: boolean;
}

const Tests = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [allTests, setAllTests] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [detailsTest, setDetailsTest] = useState<LabTest | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('tests')
                    .select('*')
                    .neq('category', 'Package') // Filter OUT Packages
                    .order('popular', { ascending: false })
                    .order('name');

                if (error) {
                    console.error('Error fetching tests:', error);
                    return;
                }

                if (data) {
                    const formattedTests: LabTest[] = data.map(test => ({
                        id: test.id,
                        name: test.name,
                        category: test.category || "General",
                        price: Number(test.price),
                        originalPrice: test.originalPrice ? Number(test.originalPrice) : undefined,
                        deliveryTime: test.deliveryTime || "24-48 hours",
                        description: test.description || "",
                        popular: test.popular || false
                    }));
                    setAllTests(formattedTests);
                }
            } catch (err) {
                console.error('Unexpected error fetching tests:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    const filteredTests = allTests.filter(test =>
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        test.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBookNow = (test: LabTest) => {
        setSelectedTest(test);
        setIsCheckoutOpen(true);
    };

    const handleViewDetails = (test: LabTest) => {
        navigate(`/test/${test.id}`);
    };

    return (
        <div className="min-h-screen bg-background glass-bg-pattern medical-pattern text-foreground font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-transparent relative">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center space-y-6 animate-fade-in">
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-[#0b3c65] drop-shadow-sm tracking-tight">
                            Lab <span className="text-[#be2c2d]">Tests</span>
                        </h1>
                        <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed">
                            Book individual lab tests from NABL certified labs. <br className="hidden sm:block" />
                            <span className="text-[#0b3c65] font-semibold">Home collection available across Bangalore.</span>
                        </p>

                        {/* Search Bar - Enhanced */}
                        <div className="max-w-2xl mx-auto mt-10 transform hover:scale-[1.01] transition-transform duration-300">
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#0b3c65] w-6 h-6 z-10 opacity-70 group-hover:opacity-100 transition-opacity" />
                                <Input
                                    type="text"
                                    placeholder="Find your test (e.g. Vitamin D, CBC, Thyroid)..."
                                    className="pl-16 pr-6 py-8 text-lg rounded-2xl glass border-white/60 focus:border-[#be2c2d]/50 focus:ring-4 focus:ring-[#be2c2d]/10 shadow-xl hover:shadow-2xl transition-all placeholder:text-gray-500 text-gray-800 backdrop-blur-md"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* All Tests Grid */}
            <section className="py-12 md:py-16 bg-transparent">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#0b3c65] border-l-4 border-[#be2c2d] pl-4">
                            {searchQuery ? `Search Results (${filteredTests.length})` : "All Lab Tests"}
                        </h2>
                    </div>

                    {filteredTests.length === 0 && !loading ? (
                        <div className="text-center py-20 glass-card rounded-3xl max-w-2xl mx-auto border-dashed border-2 border-[#0b3c65]/20">
                            <Search className="w-16 h-16 text-[#0b3c65]/30 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-[#0b3c65]">No matches found</h3>
                            <p className="text-[#0b3c65]/60 mt-2">
                                We couldn't find any test matching "{searchQuery}". <br />
                                Try checking for typos or use broader keywords.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-6 border-[#be2c2d] text-[#be2c2d] hover:bg-[#be2c2d]/5"
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
                                    className="glass-card border border-white/60 shadow-lg hover:shadow-2xl hover:shadow-[#be2c2d]/10 transition-all duration-300 rounded-[2rem] overflow-hidden group hover:-translate-y-2 bg-gradient-to-br from-white/95 to-[#be2c2d]/5 backdrop-blur-xl"
                                >
                                    <CardHeader className="p-6 pb-3">
                                        <div className="flex items-start justify-between mb-3">
                                            <Badge variant="outline" className="text-[#0b3c65]/80 border-[#0b3c65]/20 bg-white/50 backdrop-blur-sm rounded-lg px-2 py-0.5">
                                                {test.category}
                                            </Badge>
                                            {test.popular && (
                                                <Badge className="bg-gradient-to-r from-[#be2c2d] to-[#be2c2d]/80 text-white border-none shadow-sm rounded-full">
                                                    Popular
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-lg font-bold text-[#0b3c65] group-hover:text-[#be2c2d] transition-colors">
                                            {test.name}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-gray-600 line-clamp-2 mt-2">
                                            {test.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-0 space-y-4">
                                        {/* Divider */}
                                        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#be2c2d]/20 to-transparent my-2" />

                                        <div className="flex items-end justify-between pt-2">
                                            <div>
                                                {test.originalPrice && (
                                                    <div className="text-xs font-semibold text-gray-400 line-through">₹{test.originalPrice}</div>
                                                )}
                                                <div className="text-xl font-extrabold text-[#be2c2d]">₹{test.price}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[#0b3c65] hover:text-[#be2c2d] hover:bg-[#be2c2d]/5 rounded-xl block"
                                                    onClick={() => handleViewDetails(test)}
                                                >
                                                    Details
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-[#be2c2d] hover:bg-[#be2c2d]/90 text-white font-bold rounded-xl px-5 shadow-md shadow-[#be2c2d]/20 hover:shadow-[#be2c2d]/40 hover:-translate-y-0.5 transition-all"
                                                    onClick={() => handleBookNow(test)}
                                                >
                                                    Add
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

            {/* Booking Checkout Modal */}
            <BookingCheckout
                open={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                cart={selectedTest ? [selectedTest] : []}
                onConfirm={() => {
                    setSelectedTest(null);
                }}
            />


            <Footer />
        </div>
    );
};

export default Tests;
