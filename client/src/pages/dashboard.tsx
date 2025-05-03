import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { Calendar, ChevronRight, Calendar as CalendarIcon, Users as UsersIcon, Award, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Sidebar from "@/components/layouts/sidebar";
import Header from "@/components/layouts/header";
import StatCard from "@/components/cards/stat-card";
import EventCard from "@/components/cards/event-card";
import ClubCard from "@/components/cards/club-card";
import ActivityFeed from "@/components/ui/activity-feed";
import CalendarDisplay from "@/components/ui/calendar-display";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: events = [] } = useQuery({
    queryKey: ["/api/events/upcoming"],
  });
  
  const { data: clubs = [] } = useQuery({
    queryKey: ["/api/users/clubs"],
  });
  
  const { data: stats = {} } = useQuery({
    queryKey: ["/api/users/stats"],
  });
  
  const { data: activities = [] } = useQuery({
    queryKey: ["/api/users/activities"],
  });
  
  const { data: calendarEvents = [] } = useQuery({
    queryKey: ["/api/users/calendar"],
  });
  
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  
  const handleRegisterEvent = (eventId: number) => {
    // Refetch relevant queries
  };
  
  const handleJoinClub = (clubId: number) => {
    // Refetch relevant queries
  };
  
  const loadMoreActivities = () => {
    // Load more activities
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isMobileOpen={sidebarOpen} onCloseMobile={handleCloseSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={handleToggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-16 md:pb-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 mb-6">
            <div className="max-w-3xl">
              <h1 className="font-poppins font-bold text-2xl md:text-3xl">Welcome back, {user?.username}!</h1>
              <p className="mt-2 text-muted-foreground">
                You have {stats.upcomingEvents || 0} upcoming events and {stats.clubMemberships || 0} club activities.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                  <Calendar className="mr-2 h-4 w-4" />
                  Register for Event
                </Button>
                <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-transparent">
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Browse Clubs
                </Button>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Registered Events" 
              value={stats.registeredEvents || 0} 
              icon={<CalendarCheck className="h-5 w-5 text-primary" />} 
              iconClass="bg-primary/10"
              trend={{
                value: "24% from last semester",
                isPositive: true
              }}
            />
            
            <StatCard 
              title="Club Memberships" 
              value={stats.clubMemberships || 0} 
              icon={<UsersIcon className="h-5 w-5 text-secondary" />} 
              iconClass="bg-secondary/10"
              trend={{
                value: "2 new this semester",
                isPositive: true
              }}
            />
            
            <StatCard 
              title="Activity Points" 
              value={stats.activityPoints || 0} 
              icon={<Award className="h-5 w-5 text-accent" />} 
              iconClass="bg-accent/10"
              trend={{
                value: "Top 15% on campus",
                isPositive: true
              }}
            />
            
            <StatCard 
              title="Upcoming Events" 
              value={stats.upcomingEvents || 0} 
              icon={<CalendarIcon className="h-5 w-5 text-destructive" />} 
              iconClass="bg-destructive/10"
              trend={{
                value: stats.nextEventName ? `Next: ${stats.nextEventName}` : "No upcoming events",
                isPositive: false
              }}
            />
          </div>
          
          {/* Upcoming Events Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-poppins font-semibold text-xl">Upcoming Events</h2>
              <Link href="/events" className="text-primary hover:underline text-sm font-medium flex items-center">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.length > 0 ? (
                events.slice(0, 3).map((event) => (
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
                ))
              ) : (
                <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Upcoming Events</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      There are no upcoming events at the moment. Check back later or browse all events.
                    </p>
                    <Link href="/events">
                      <Button>Browse All Events</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* My Clubs Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-poppins font-semibold text-xl">My Clubs</h2>
              <Link href="/clubs" className="text-primary hover:underline text-sm font-medium flex items-center">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {clubs.length > 0 ? (
                clubs.slice(0, 4).map((club) => (
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
                ))
              ) : (
                <Card className="col-span-1 md:col-span-2 lg:col-span-4">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Club Memberships</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      You are not a member of any clubs yet. Join a club to see it here.
                    </p>
                    <Link href="/clubs">
                      <Button>Explore Clubs</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Recent Activity & Calendar Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity Feed */}
            <Card className="lg:col-span-2 card-hover">
              <CardContent className="p-4">
                <h2 className="font-poppins font-semibold text-lg mb-4">Recent Activity</h2>
                
                <ActivityFeed 
                  activities={activities} 
                  onLoadMore={loadMoreActivities}
                  hasMore={activities.length >= 4}
                />
              </CardContent>
            </Card>
            
            {/* Mini Calendar */}
            <Card className="card-hover">
              <CardContent className="p-4">
                <h2 className="font-poppins font-semibold text-lg mb-4">My Calendar</h2>
                
                <CalendarDisplay events={calendarEvents} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
