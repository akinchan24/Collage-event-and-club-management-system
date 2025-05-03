import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Event = {
  id: number;
  title: string;
  date: Date;
  time: string;
  color: string;
};

type CalendarDisplayProps = {
  events: Event[];
};

export default function CalendarDisplay({ events }: CalendarDisplayProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Get all days in current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate how many empty cells to render before first day
  const startDayOfWeek = getDay(monthStart);
  
  // Find events for this month
  const upcomingEvents = events
    .filter(event => isSameMonth(new Date(event.date), currentMonth))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  
  // Generate days of week header
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  // Find events for specific days in the current month
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day.getDate() && 
             eventDate.getMonth() === day.getMonth() && 
             eventDate.getFullYear() === day.getFullYear();
    });
  };

  return (
    <div>
      {/* Month Selector */}
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToPreviousMonth}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium">{format(currentMonth, 'MMMM yyyy')}</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goToNextMonth}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center mb-4">
        {/* Days of week header */}
        {daysOfWeek.map((day, i) => (
          <div key={i} className="text-muted-foreground text-xs font-medium">{day}</div>
        ))}
        
        {/* Empty cells before first day of month */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-start-${i}`} className="text-muted text-sm py-2"></div>
        ))}
        
        {/* Days of the month */}
        {daysInMonth.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const hasEvent = dayEvents.length > 0;
          
          return (
            <div 
              key={i} 
              className={cn(
                "text-sm py-2 relative",
                isToday(day) ? "font-bold" : "",
                hasEvent ? 
                  `font-medium rounded-full bg-${dayEvents[0].color}-500/20` : 
                  ""
              )}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
      
      {/* Upcoming Events List */}
      <h3 className="font-medium text-sm mb-2">Upcoming</h3>
      {upcomingEvents.length > 0 ? (
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex items-center">
              <div className={`w-2 h-2 rounded-full bg-${event.color}-500`}></div>
              <div className="ml-2">
                <p className="text-xs font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(event.date), 'MMM d')}, {event.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No upcoming events this month</p>
      )}
    </div>
  );
}
