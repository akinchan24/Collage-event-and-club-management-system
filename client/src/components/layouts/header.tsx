import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

type HeaderProps = {
  onMobileMenuToggle: () => void;
};

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/events":
        return "Events";
      case "/clubs":
        return "Clubs";
      case "/my-activities":
        return "My Activities";
      case "/admin/events":
        return "Manage Events";
      case "/admin/clubs":
        return "Club Administration";
      case "/admin/analytics":
        return "Analytics";
      default:
        return "CampusConnect";
    }
  };

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 md:px-6">
      <button 
        className="md:hidden text-muted-foreground focus:outline-none" 
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <h2 className="font-poppins font-semibold text-lg hidden md:block">{getPageTitle()}</h2>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-64 bg-muted text-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
        
        <button className="relative p-2 text-muted-foreground hover:text-foreground focus:outline-none">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground text-xs">
            3
          </span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground md:hidden">
          {user?.username?.substring(0, 2).toUpperCase() || "?"}
        </div>
      </div>
    </header>
  );
}
