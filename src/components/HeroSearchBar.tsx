import { useState, useRef, useEffect } from "react";
import { Search, Upload, X, Loader2, Plus, ShoppingCart, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { openWhatsApp } from "@/lib/whatsapp";
import BookingCheckout from "./BookingCheckout";

interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description?: string;
}

interface ExtractedTest {
  name: string;
  description?: string;
}

const HeroSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [extractedTests, setExtractedTests] = useState<ExtractedTest[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cart, setCart] = useState<LabTest[]>([]);
  const [allTests, setAllTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tests')
        .select('*');

      if (error) throw error;

      if (data) {
        const formattedTests: LabTest[] = data.map(test => ({
          id: test.id,
          name: test.name,
          category: test.category || "General",
          price: Number(test.price),
          originalPrice: test.originalPrice ? Number(test.originalPrice) : undefined,
          description: test.description || ""
        }));
        setAllTests(formattedTests);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast({
        title: "Error fetching tests",
        description: "Could not load test data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = searchQuery
    ? allTests.filter((test) =>
      test.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8) // Limit to 8 results for better UI
    : [];

  const addToCart = (test: LabTest) => {
    if (!cart.some(t => t.id === test.id)) {
      setCart([...cart, test]);
      toast({
        title: "Added to cart",
        description: test.name,
      });
    }
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const removeFromCart = (testId: string) => {
    setCart(cart.filter((t) => t.id !== testId));
  };

  const clearCart = () => {
    setCart([]);
    setExtractedTests([]);
    setShowResults(false);
  };

  const bookSlotOnWhatsApp = () => {
    if (cart.length === 0) return;
    setIsCheckoutOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setExtractedTests([]);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;

        const { data, error } = await supabase.functions.invoke("parse-prescription", {
          body: { imageBase64: base64 },
        });

        if (error) {
          throw error;
        }

        if (data.error) {
          toast({
            title: "Could not extract tests",
            description: data.error,
            variant: "destructive",
          });
        } else if (data.tests && data.tests.length > 0) {
          setExtractedTests(data.tests);
          setShowResults(true);
          toast({
            title: "Prescription parsed!",
            description: `Found ${data.tests.length} test(s). Click to add to cart.`,
          });
        } else {
          toast({
            title: "No tests found",
            description: "Could not find any medical tests in the image",
            variant: "destructive",
          });
        }

        setIsUploading(false);
      };

      reader.onerror = () => {
        toast({
          title: "Error reading file",
          description: "Please try again",
          variant: "destructive",
        });
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error processing prescription",
        description: "Please try again later",
        variant: "destructive",
      });
      setIsUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addExtractedTestToCart = (testName: string) => {
    const placeholderTest: LabTest = {
      id: Date.now().toString(),
      name: testName,
      category: "Prescription",
      price: 0,
      description: "Extracted from prescription"
    };

    if (!cart.some(t => t.name === testName)) {
      setCart([...cart, placeholderTest]);
      toast({
        title: "Added to cart",
        description: testName,
      });
    }
  };

  const addAllExtractedTests = () => {
    const newTests = extractedTests
      .filter(t => !cart.some(c => c.name === t.name))
      .map(t => ({
        id: Date.now().toString() + Math.random(),
        name: t.name,
        category: "Prescription",
        price: 0,
        description: t.description
      }));

    if (newTests.length > 0) {
      setCart([...cart, ...newTests]);
      toast({
        title: "Added all tests to cart",
        description: `${newTests.length} test(s) added`,
      });
    }
  };

  return (
    <div className="w-full relative z-50">
      {/* Glass Search Bar */}
      <div className="relative flex items-center glass rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-16 border border-white/40 z-[101]">
        <div className="flex-1 flex items-center h-full">
          <Search className="w-5 h-5 text-gray-500 ml-6" />
          <Input
            type="text"
            placeholder="Search for tests (e.g. CBC, Vitamin D)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-gray-500 h-full px-4 text-gray-800 font-medium"
          />
        </div>

        <div className="flex items-center h-full pr-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-10 px-4 mr-2 text-primary hover:text-primary hover:bg-primary/10 rounded-lg font-medium transition-colors"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            <span className="hidden sm:inline">Upload Rx</span>
          </Button>

          <Button
            className="h-12 px-8 bg-primary hover:bg-primary-light text-white font-bold rounded-lg shadow-md transition-all hover:scale-105"
            onClick={() => { }}
          >
            Search
          </Button>
        </div>

        {/* Glass Suggestions Dropdown */}
        {showSuggestions && filteredTests.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 glass-card !bg-white rounded-2xl shadow-2xl z-[100] overflow-hidden animate-fade-in border border-white/50">
            <ul className="py-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {filteredTests.map((test, index) => {
                const hasDiscount = test.originalPrice && test.originalPrice > test.price;
                const discountPercentage = hasDiscount
                  ? Math.round(((test.originalPrice! - test.price) / test.originalPrice!) * 100)
                  : 0;

                return (
                  <li key={index}>
                    <button
                      className="w-full px-5 py-3.5 text-left hover:bg-primary/5 transition-all flex items-center justify-between gap-3 group"
                      onMouseDown={() => addToCart(test)}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-800 font-medium group-hover:text-primary transition-colors block truncate">
                          {test.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate block opacity-70">
                          {test.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {hasDiscount && (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-xs text-gray-400 line-through">₹{test.originalPrice}</span>
                              <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                                {discountPercentage}% OFF
                              </span>
                            </div>
                          )}
                          <span className="text-sm font-bold text-primary block">₹{test.price}</span>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all flex-shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Extracted Tests UI - Glass */}
      {showResults && extractedTests.length > 0 && (
        <div className="mt-4 glass-card rounded-2xl p-4 shadow-xl animate-fade-in border border-white/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-800">Tests from prescription:</h4>
            <Button variant="ghost" size="sm" onClick={addAllExtractedTests}>
              Add All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {extractedTests.map((test, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className={`rounded-full transition-colors border ${cart.some(c => c.name === test.name)
                  ? "bg-primary text-white border-primary"
                  : "bg-white/50 border-primary/30 hover:bg-primary/10 text-gray-700"
                  }`}
                onClick={() => addExtractedTestToCart(test.name)}
                disabled={cart.some(c => c.name === test.name)}
              >
                {cart.some(c => c.name === test.name) ? "✓ " : "+ "}
                {test.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Cart - Glass */}
      {cart.length > 0 && (
        <div className="mt-4 glass-card rounded-2xl p-5 shadow-xl animate-fade-in border border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <ShoppingCart className="w-4 h-4 text-primary" />
              </div>
              <h4 className="font-bold text-gray-800">
                Your Cart ({cart.length})
              </h4>
            </div>
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8">
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {cart.map((test, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/80 border border-primary/20 text-gray-800 px-3 py-1.5 rounded-full text-sm shadow-sm"
              >
                <span className="font-medium">{test.name}</span>
                <button
                  onClick={() => removeFromCart(test.id)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <Button
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            onClick={bookSlotOnWhatsApp}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Book Slot on WhatsApp
          </Button>
        </div>
      )}

      <BookingCheckout
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        cart={cart}
        onConfirm={() => {
          setCart([]);
          setExtractedTests([]);
          setShowResults(false);
          toast({
            title: "Booking Initiated",
            description: "Redirecting you to WhatsApp...",
          });
        }}
      />
    </div>
  );
};

export default HeroSearchBar;
