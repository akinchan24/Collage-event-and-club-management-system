import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import EventsPage from "@/pages/events-page";
import ClubsPage from "@/pages/clubs-page";
import MyActivities from "@/pages/my-activities";
import AuthPage from "@/pages/auth-page";
import EventsManage from "@/pages/admin/events-manage";
import ClubsManage from "@/pages/admin/clubs-manage";
import Analytics from "@/pages/admin/analytics";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <ProtectedRoute path="/clubs" component={ClubsPage} />
      <ProtectedRoute path="/my-activities" component={MyActivities} />
      
      {/* Admin routes */}
      <ProtectedRoute path="/admin/events" component={EventsManage} />
      <ProtectedRoute path="/admin/clubs" component={ClubsManage} />
      <ProtectedRoute path="/admin/analytics" component={Analytics} />
      
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
