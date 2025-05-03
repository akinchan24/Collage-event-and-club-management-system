import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layouts/sidebar";
import Header from "@/components/layouts/header";
import ClubCard from "@/components/cards/club-card";
import { Loader2, Search, Filter, Users } from "lucide-react";
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

export default function ClubsPage() {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewType, setViewType] = useState("all");
  
  // Fetch clubs with filters
  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ["/api/clubs", viewType, categoryFilter, searchQuery],
  });
  
  // Fetch club categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/clubs/categories"],
  });
  
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  
  const handleJoinClub = (clubId: number) => {
    // Invalidate queries
  };
  
  const filteredClubs = clubs.filter((club) => {
    if (searchQuery && !club.name.toLowerCase().includes(searchQuery.toLowerCase())) {
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
            <h1 className="font-poppins font-bold text-2xl md:text-3xl mb-2">Campus Clubs</h1>
            <p className="text-muted-foreground">
              Explore and join student clubs and organizations on campus
            </p>
          </div>
          
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  className="pl-10"
                  placeholder="Search clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
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
            </div>
            
            <Tabs defaultValue="all" className="w-full" value={viewType} onValueChange={setViewType}>
              <TabsList>
                <TabsTrigger value="all">All Clubs</TabsTrigger>
                <TabsTrigger value="joined">My Clubs</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Clubs Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  id={club.id}
                  name={club.name}
                  description={club.description}
                  memberCount={club.memberCount}
                  category={club.category}
                  nextMeeting={club.nextMeeting}
                  isMember={club.isMember}
                  onJoin={handleJoinClub}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-xl mb-2">No Clubs Found</CardTitle>
                <CardDescription className="text-center max-w-md">
                  {searchQuery || categoryFilter !== "all" ? 
                    "No clubs match your current filters. Try adjusting your search criteria." : 
                    "There are no clubs available at the moment."}
                </CardDescription>
                {(searchQuery || categoryFilter !== "all") && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
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
