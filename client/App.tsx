import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Header from "./components/layout/Header";
import ServicesFooter from "./components/layout/ServicesFooter";
import ServicesHomePage from "./pages/ServicesHomePage";
import HomePage from "./pages/HomePage";
import { supabase } from "./lib/supabase";
import {
  cacheHomeIdentity,
  getCachedHomeIdentity,
  clearCachedHomeIdentity,
  HomeRole,
} from "./lib/homeIdentity";
import ServicesProfilePage from "./pages/ServicesProfilePage";
import BookingPage from "./pages/BookingPage";
import MenuPage from "./pages/MenuPage";
import FlutterwaveReturnPage from "./pages/FlutterwaveReturnPage";
import MenuManagementPage from "./pages/MenuManagementPage";
// ProfilePage disabled - see DISABLED_FEATURES.md
import StaffPortalPage from "./pages/StaffPortalPage";
import ManagementPage from "./pages/ManagementPage";
import TravelDeskPage from "./pages/TravelDeskPage";
import EventsPage from "./pages/EventsPage";
import BlogPage from "./pages/BlogPage";
import ShopPage from "./pages/ShopPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import TasksPage from "./pages/TasksPage";
import ReportsPage from "./pages/ReportsPage";
import AccountsPage from "./pages/AccountsPage";
import ReviewsPage from "./pages/ReviewsPage";
import ConciergePage from "./pages/ConciergePage";
import OffersPage from "./pages/OffersPage";
import BillingPlansPage from "./pages/BillingPlansPage";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import PayoutMethodPage from "./pages/PayoutMethodPage";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";
import { Toaster } from "./components/ui/sonner";
import "./global.css";

function RoleAwareHomePage() {
  const cachedIdentity = getCachedHomeIdentity();
  const [role, setRole] = useState<HomeRole>(cachedIdentity?.role ?? "guest");
  const [displayName, setDisplayName] = useState(cachedIdentity?.displayName ?? "Special Guest");
  const [isReady, setIsReady] = useState(Boolean(cachedIdentity));

  useEffect(() => {
    let active = true;

    const setGuestIdentity = () => {
      if (!active) return;
      clearCachedHomeIdentity();
      setRole("guest");
      setDisplayName("Special Guest");
      setIsReady(true);
    };

    const loadHomeIdentity = async (user: { id: string } | null) => {
      if (!user) {
        setGuestIdentity();
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role, first_name, last_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;

      const profileRole = profile?.role as HomeRole | undefined;
      const nextRole = profileRole === "manager" || profileRole === "service_provider"
        ? profileRole
        : "guest";
      const fullName = [profile?.first_name, profile?.last_name]
        .filter((part): part is string => Boolean(part?.trim()))
        .join(" ");

      const nextDisplayName = fullName ||
        (nextRole === "manager"
          ? "Manager"
          : nextRole === "service_provider"
            ? "Service Provider"
            : "Special Guest");

      cacheHomeIdentity({ role: nextRole, displayName: nextDisplayName });
      setRole(nextRole);
      setDisplayName(nextDisplayName);
      setIsReady(true);
    };

    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      await loadHomeIdentity(user);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setTimeout(() => {
          loadHomeIdentity(session?.user ?? null).catch(setGuestIdentity);
        }, 0);
      },
    );

    initialize().catch(setGuestIdentity);

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!isReady) {
    return <div className="min-h-screen" aria-busy="true" />;
  }

  if (role === "guest") {
    return <HomePage displayName={displayName} />;
  }

  return <ServicesHomePage role={role} displayName={displayName} />;
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<RoleAwareHomePage />} />
              <Route path="/book" element={<BookingPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/checkout/flutterwave-return" element={<FlutterwaveReturnPage />} />
              <Route path="/staff/menu" element={<MenuManagementPage />} />
              <Route path="/profile" element={<ServicesProfilePage />} />
              <Route path="/staff" element={<StaffPortalPage />} />
              <Route path="/management" element={<ManagementPage />} />
              <Route path="/travel" element={<TravelDeskPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/tasks/*" element={<TasksPage />} />
              <Route path="/tasks/new" element={<TasksPage />} />
              <Route path="/tasks/list" element={<TasksPage />} />
              <Route path="/tasks/chat" element={<TasksPage />} />
              <Route path="/reports/*" element={<ReportsPage />} />
              <Route path="/reports/tasks" element={<ReportsPage />} />
              <Route path="/reports/performance" element={<ReportsPage />} />
              <Route path="/reports/vendors" element={<ReportsPage />} />
              <Route path="/accounts/*" element={<AccountsPage />} />
              <Route path="/accounts/vendors" element={<AccountsPage />} />
              <Route path="/accounts/quotes" element={<AccountsPage />} />
              <Route path="/accounts/billing" element={<AccountsPage />} />
              <Route path="/billing/plans" element={<BillingPlansPage />} />
              <Route path="/billing/payment-methods" element={<PaymentMethodPage />} />
              <Route path="/billing/payout-methods" element={<PayoutMethodPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/concierge" element={<ConciergePage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route
                path="/spa"
                element={<PlaceholderPage section="Spa & Wellness" />}
              />
              <Route
                path="/fitness"
                element={<PlaceholderPage section="Fitness Center" />}
              />
              <Route path="/concierge" element={<ConciergePage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <ServicesFooter />
          <Toaster />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
