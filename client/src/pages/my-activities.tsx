import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layouts/sidebar";
import Header from "@/components/layouts/header";
import ActivityFeed from "@/components/ui/activity-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  UserCheck, 
  Award,
  Star,
  Clock,
  Loader2,
  ChevronRight,
  Users,
  Code,
  Swords,
  Music,
  Volleyball,
  Pencil,
  BookOpen,
  Camera,
  Heart,
  Globe
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function MyActivities() {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [activityPage, setActivityPage] = useState(0);
  
  // Fetch user activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/users/activities", activityPage],
  });
  
  // Fetch user stats
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/users/stats"],
  });
  
  // Fetch user's registered events
  const { data: registeredEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/users/events"],
  });
  
  // Fetch user's clubs
  const { data: userClubs = [], isLoading: clubsLoading } = useQuery({
    queryKey: ["/api/users/clubs"],
  });
  
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  
  const loadMoreActivities = () => {
    setActivityPage(prev => prev + 1);
  };
  
  // Filter activities based on active tab
  const filteredActivities = activities.filter(activity => {
    if (activeTab === "all") return true;
    return activity.activityType === activeTab;
  });
  
  const isLoading = activitiesLoading || statsLoading || eventsLoading || clubsLoading;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isMobileOpen={sidebarOpen} onCloseMobile={handleCloseSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={handleToggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-16 md:pb-6">
          <div className="mb-6">
            <h1 className="font-poppins font-bold text-2xl md:text-3xl mb-2">My Activities</h1>
            <p className="text-muted-foreground">
              Track your participation in campus events and clubs
            </p>
          </div>
          
          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Registered Events</p>
                    <h3 className="font-poppins font-semibold text-3xl mt-1">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.registeredEvents || 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Club Memberships</p>
                    <h3 className="font-poppins font-semibold text-3xl mt-1">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.clubMemberships || 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-full">
                    <UserCheck className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Activity Points</p>
                    <h3 className="font-poppins font-semibold text-3xl mt-1">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.activityPoints || 0}
                    </h3>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-full">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Feed */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList className="grid grid-cols-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="event_registered">Events</TabsTrigger>
                      <TabsTrigger value="club_joined">Clubs</TabsTrigger>
                      <TabsTrigger value="points_earned">Points</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  {activitiesLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredActivities.length > 0 ? (
                    <ActivityFeed 
                      activities={filteredActivities}
                      onLoadMore={loadMoreActivities}
                      isLoading={activitiesLoading}
                      hasMore={filteredActivities.length >= 10}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Star className="h-12 w-12 text-muted-foreground mb-3 opacity-20" />
                      <h3 className="font-medium text-lg mb-1">No Activities Yet</h3>
                      <p className="text-muted-foreground max-w-md mb-4">
                        Start participating in campus events and joining clubs to see your activities here.
                      </p>
                      <div className="flex gap-3">
                        <Link href="/events">
                          <Button variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Browse Events
                          </Button>
                        </Link>
                        <Link href="/clubs">
                          <Button variant="outline">
                            <Users className="h-4 w-4 mr-2" />
                            Browse Clubs
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Upcoming Events */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Upcoming Events</CardTitle>
                  <Link href="/events" className="text-primary hover:underline text-sm font-medium flex items-center">
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardHeader>
                <CardContent>
                  {eventsLoading ? (
                    <div className="flex justify-center items-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : registeredEvents.length > 0 ? (
                    <div className="space-y-4">
                      {registeredEvents
                        .filter((event: any) => new Date(event.date) >= new Date())
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 3)
                        .map((event: any) => (
                          <div key={event.id} className="flex justify-between items-start border-b border-border pb-4">
                            <div className="flex items-start space-x-3">
                              <div className="bg-primary/10 text-primary rounded p-3 flex flex-col items-center justify-center min-w-14">
                                <span className="text-xs font-medium">
                                  {format(new Date(event.date), 'MMM').toUpperCase()}
                                </span>
                                <span className="text-xl font-bold">
                                  {format(new Date(event.date), 'd')}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium">{event.title}</h4>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{event.time}</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary">{event.location}</Badge>
                          </div>
                        ))}
                        
                      {registeredEvents.filter((event: any) => new Date(event.date) >= new Date()).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          No upcoming events
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      You haven't registered for any events yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* My Clubs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Clubs</CardTitle>
                <Link href="/clubs" className="text-primary hover:underline text-sm font-medium flex items-center">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </CardHeader>
              <CardContent>
                {clubsLoading ? (
                  <div className="flex justify-center items-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : userClubs.length > 0 ? (
                  <div className="space-y-4">
                    {userClubs.map((club: any) => {
                      // Dynamically set icon and color based on club category
                      const iconColor = getClubIconColor(club.category);
                      
                      return (
                        <div key={club.id} className="flex items-start space-x-3 border-b border-border pb-4">
                          <div className={`${iconColor.bgColor} rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0`}>
                            {iconColor.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{club.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{club.memberCount} members</p>
                            {club.nextMeeting && (
                              <div className="mt-2 text-xs flex items-center">
                                <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                <span>Next: {club.nextMeeting}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>You haven't joined any clubs yet</p>
                    <Link href="/clubs">
                      <Button variant="outline" className="mt-4">
                        Browse Clubs
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper function to determine club icon and color based on category
function getClubIconColor(category: string) {
  switch (category) {
    case 'coding':
      return { 
        icon: <Code className="h-5 w-5 text-white" />, 
        bgColor: 'bg-primary' 
      };
    case 'chess':
      return { 
        icon: <Swords className="h-5 w-5 text-white" />, 
        bgColor: 'bg-secondary' 
      };
    case 'music':
      return { 
        icon: <Music className="h-5 w-5 text-white" />, 
        bgColor: 'bg-accent' 
      };
    case 'basketball':
      return { 
        icon: <Volleyball className="h-5 w-5 text-white" />, 
        bgColor: 'bg-destructive' 
      };
    case 'art':
      return { 
        icon: <Pencil className="h-5 w-5 text-white" />, 
        bgColor: 'bg-[#10B981]' 
      };
    case 'literature':
      return { 
        icon: <BookOpen className="h-5 w-5 text-white" />, 
        bgColor: 'bg-[#F59E0B]' 
      };
    case 'photography':
      return { 
        icon: <Camera className="h-5 w-5 text-white" />, 
        bgColor: 'bg-[#3B82F6]' 
      };
    case 'volunteer':
      return { 
        icon: <Heart className="h-5 w-5 text-white" />, 
        bgColor: 'bg-[#EC4899]' 
      };
    case 'international':
      return { 
        icon: <Globe className="h-5 w-5 text-white" />, 
        bgColor: 'bg-[#8B5CF6]' 
      };
    default:
      return { 
        icon: <Users className="h-5 w-5 text-white" />, 
        bgColor: 'bg-primary' 
      };
  }
}


