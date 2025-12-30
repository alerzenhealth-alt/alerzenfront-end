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

import Connect from "./pages/Connect";
// Admin (Note: We might want to nest this in dashboard or keep separate? 
// For now, let's keep it under dashboard via conditional rendering OR a separate route. 
// A separate route is cleaner for a "tool" feel).
// Wait, the user asked for a tool IN backend. Usually that implies inside the dashboard.
// Let's modify AdminDashboard to include it instead of a separate route to keep auth simple.
// BUT I also need to import Connect.

const App = () => (
    // ...
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/connect/:id" element={<Connect />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */ }
<Route path="*" element={<NotFound />} />
        </Routes >
      </BrowserRouter >
    </TooltipProvider >
  </QueryClientProvider >
);

export default App;
