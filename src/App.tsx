import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/SplashScreen";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import PublicRequests from "./pages/PublicRequests";
import Requests from "./pages/Requests";
import Donate from "./pages/Donate";
import Profile from "./pages/Profile";
import CreateRequest from "./pages/CreateRequest";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminDonations from "./pages/admin/AdminDonations";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminNotifications from "./pages/admin/AdminNotifications";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("hasSeenSplash");
    if (seen) {
      setShowSplash(false);
      setHasSeenSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setHasSeenSplash(true);
    sessionStorage.setItem("hasSeenSplash", "true");
  };

  return (
    <>
      {showSplash && !hasSeenSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/requests" element={<PublicRequests />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Protected routes */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/my-requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
          <Route path="/donate" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/create-request" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
          
          {/* Admin routes - completely separate from user auth */}
          <Route path="/admin/login" element={<AdminAuth />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/donations" element={<AdminDonations />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
