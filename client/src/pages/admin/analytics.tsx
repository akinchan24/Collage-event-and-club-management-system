import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layouts/sidebar";
import Header from "@/components/layouts/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { 
  Users, 
  Calendar, 
  UsersRound, 
  CalendarCheck, 
  TrendingUp, 
  Award,
  Loader2
} from "lucide-react";

export default function Analytics() {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/admin/analytics"],
  });
  
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  
  // Custom colors for charts
  const COLORS = ["#6366F1", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981"];
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isMobileOpen={sidebarOpen} onCloseMobile={handleCloseSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={handleToggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-16 md:pb-6">
          <div className="mb-6">
            <h1 className="font-poppins font-bold text-2xl md:text-3xl mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor student participation and engagement across campus activities
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Users</p>
                        <h3 className="font-poppins font-semibold text-3xl mt-1">{analytics?.usersCount || 0}</h3>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Events</p>
                        <h3 className="font-poppins font-semibold text-3xl mt-1">{analytics?.eventsCount || 0}</h3>
                      </div>
                      <div className="p-3 bg-secondary/10 rounded-full">
                        <Calendar className="h-6 w-6 text-secondary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Total Clubs</p>
                        <h3 className="font-poppins font-semibold text-3xl mt-1">{analytics?.clubsCount || 0}</h3>
                      </div>
                      <div className="p-3 bg-accent/10 rounded-full">
                        <UsersRound className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Events by Month */}
                <Card className="h-[400px]">
                  <CardHeader>
                    <CardTitle>Events by Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics?.eventsByMonth || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#D1D5DB" />
                        <YAxis stroke="#D1D5DB" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            borderColor: '#374151',
                            color: '#F3F4F6'
                          }}
                          itemStyle={{ color: '#F3F4F6' }}
                          labelStyle={{ color: '#F3F4F6' }}
                        />
                        <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Popular Events & Clubs */}
                <Card className="h-[400px] flex flex-col">
                  <CardHeader>
                    <CardTitle>Popularity Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics?.topEvents?.map((event: any) => ({
                            name: event.title,
                            value: event.registrations,
                          })) || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {(analytics?.topEvents || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            borderColor: '#374151',
                            color: '#F3F4F6'
                          }}
                          itemStyle={{ color: '#F3F4F6' }}
                          labelStyle={{ color: '#F3F4F6' }}
                          formatter={(value, name, props) => [`${value} registrations`, props.payload.name]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              {/* Top Events & Clubs Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Events Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CalendarCheck className="h-5 w-5 mr-2" />
                      Most Popular Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.topEvents?.map((event: any, index: number) => (
                        <div key={event.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary mr-4">
                              {index + 1}
                            </div>
                            <span className="font-medium">{event.title}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-muted-foreground mr-2" />
                            <span>{event.registrations} registrations</span>
                          </div>
                        </div>
                      ))}
                      
                      {(!analytics?.topEvents || analytics.topEvents.length === 0) && (
                        <div className="text-center py-4 text-muted-foreground">
                          No event data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Top Clubs Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UsersRound className="h-5 w-5 mr-2" />
                      Most Popular Clubs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.topClubs?.map((club: any, index: number) => (
                        <div key={club.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-accent/10 text-accent mr-4">
                              {index + 1}
                            </div>
                            <span className="font-medium">{club.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-muted-foreground mr-2" />
                            <span>{club.members} members</span>
                          </div>
                        </div>
                      ))}
                      
                      {(!analytics?.topClubs || analytics.topClubs.length === 0) && (
                        <div className="text-center py-4 text-muted-foreground">
                          No club data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
