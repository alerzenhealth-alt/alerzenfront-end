import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Tests from "./pages/Tests";
import PartnerLabs from "./pages/PartnerLabs";
import HealthPackages from "./pages/HealthPackages";
import AboutUs from "./pages/AboutUs";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/Admin/Login";
import AdminDashboard from "./pages/Admin/Dashboard";
import TestDetails from "./pages/TestDetails";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/partner-labs" element={<PartnerLabs />} />
          <Route path="/health-packages" element={<HealthPackages />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/test/:id" element={<TestDetails />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<FAQ />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
