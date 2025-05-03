import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layouts/sidebar";
import Header from "@/components/layouts/header";
import EventCard from "@/components/cards/event-card";
import { Loader2, Search, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EventsPage() {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("upcoming");
  const [viewType, setViewType] = useState("all");
  
  // Fetch events with filters
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events", viewType, categoryFilter, dateFilter, searchQuery],
  });
  
  // Fetch event categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/events/categories"],
  });
  
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  
  const handleRegisterEvent = (eventId: number) => {
    // Invalidate queries
  };
  
  const filteredEvents = events.filter((event) => {
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isMobileOpen={sidebarOpen} onCloseMobile={handleCloseSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={handleToggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-16 md:pb-6">
          <div className="mb-6">
            <h1 className="font-poppins font-bold text-2xl md:text-3xl mb-2">Campus Events</h1>
            <p className="text-muted-foreground">
              Discover and register for upcoming events happening around campus
            </p>
          </div>
          
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  className="pl-10"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="past">Past Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full" value={viewType} onValueChange={setViewType}>
              <TabsList>
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="registered">My Registered Events</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Events Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  date={event.date}
                  time={event.time}
                  location={event.location}
                  imageUrl={event.imageUrl}
                  categories={event.categories}
                  isRegistered={event.isRegistered}
                  onRegister={handleRegisterEvent}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-xl mb-2">No Events Found</CardTitle>
                <CardDescription className="text-center max-w-md">
                  {searchQuery || categoryFilter !== "all" || dateFilter !== "upcoming" ? 
                    "No events match your current filters. Try adjusting your search criteria." : 
                    "There are no upcoming events scheduled at the moment. Check back later!"}
                </CardDescription>
                {(searchQuery || categoryFilter !== "all" || dateFilter !== "upcoming") && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                      setDateFilter("upcoming");
                    }}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
