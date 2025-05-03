import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  UserCheck, 
  CalendarPlus, 
  UserCog, 
  BarChart, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";

type SidebarProps = {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
};

export default function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
      onCloseMobile();
    }
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/events", label: "Events", icon: <CalendarDays className="w-5 h-5" /> },
    { href: "/clubs", label: "Clubs", icon: <Users className="w-5 h-5" /> },
    { href: "/my-activities", label: "My Activities", icon: <UserCheck className="w-5 h-5" /> },
  ];

  const adminItems = [
    { href: "/admin/events", label: "Manage Events", icon: <CalendarPlus className="w-5 h-5" /> },
    { href: "/admin/clubs", label: "Club Administration", icon: <UserCog className="w-5 h-5" /> },
    { href: "/admin/analytics", label: "Analytics", icon: <BarChart className="w-5 h-5" /> },
  ];

  const sidebarClass = cn(
    "bg-sidebar fixed top-0 bottom-0 left-0 w-64 flex-shrink-0 flex flex-col h-full z-40 transition-transform duration-300 transform md:translate-x-0",
    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  );

  const overlayClass = cn(
    "fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity",
    isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
  );

  return (
    <>
      <div className={overlayClass} onClick={onCloseMobile}></div>
      <div className={sidebarClass}>
        <div className="py-6 px-4 flex items-center border-b border-sidebar-border">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.996.002 1.069c0 .655-.532 1.19-1.18 1.187H6.5c-.648 0-1.18.533-1.18 1.187v1.802c0 .653.532 1.187 1.18 1.187h.396c-.149.382-.229.8-.229 1.229v.039c0 .858.672 1.542 1.5 1.542.828 0 1.5-.684 1.5-1.542v-.039c0-.429-.08-.847-.228-1.229h2.462c-.149.382-.229.8-.229 1.229v.039c0 .858.672 1.542 1.5 1.542.828 0 1.5-.684 1.5-1.542v-.039c0-.429-.08-.847-.228-1.229h.228c.648 0 1.179-.534 1.179-1.187v-1.685c0-.194-.273-.807-.273-.807 0-.48.39-.88.87-.881h.002l1.188-.005c.468-.002.846-.377.846-.843l.003-1.178 3.044-1.292a1 1 0 000-1.84l-7-3z" />
            </svg>
          </div>
          <h1 className="ml-3 font-poppins font-semibold text-lg text-white">CampusConnect</h1>
        </div>
        
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-white font-poppins font-medium">
              {user?.username?.substring(0, 2).toUpperCase() || "?"}
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm">{user?.username || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.role || "Student"}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-2 text-xs font-medium uppercase text-muted-foreground">Main</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebarOnMobile}
              className={cn(
                "sidebar-item flex items-center px-4 py-3 text-sm font-medium text-foreground",
                location === item.href && "bg-primary bg-opacity-10 text-primary"
              )}
            >
              <span className={cn("w-5", location === item.href ? "text-primary" : "text-muted-foreground")}>
                {item.icon}
              </span>
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
          
          {isAdmin && (
            <>
              <div className="px-3 mt-6 mb-2 text-xs font-medium uppercase text-muted-foreground">Admin</div>
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebarOnMobile}
                  className={cn(
                    "sidebar-item flex items-center px-4 py-3 text-sm font-medium text-foreground",
                    location === item.href && "bg-primary bg-opacity-10 text-primary"
                  )}
                >
                  <span className={cn("w-5", location === item.href ? "text-primary" : "text-muted-foreground")}>
                    {item.icon}
                  </span>
                  <span className="ml-3">{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-sidebar-border">
          <Button 
            variant="outline" 
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
