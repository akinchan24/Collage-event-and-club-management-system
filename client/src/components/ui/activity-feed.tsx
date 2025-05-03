import { format } from "date-fns";
import { Calendar, Users, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ActivityItem = {
  id: number;
  type: "event_registered" | "club_joined" | "points_earned" | "comment_posted";
  title: string;
  entityName: string;
  timestamp: string;
  points?: number;
};

const activityTypeConfig = {
  event_registered: {
    icon: Calendar,
    bgColor: "bg-primary",
  },
  club_joined: {
    icon: Users,
    bgColor: "bg-accent",
  },
  points_earned: {
    icon: Star,
    bgColor: "bg-[#10B981]",
  },
  comment_posted: {
    icon: MessageSquare,
    bgColor: "bg-secondary",
  },
};

type ActivityFeedProps = {
  activities: ActivityItem[];
  onLoadMore: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
};

export default function ActivityFeed({ 
  activities, 
  onLoadMore, 
  isLoading = false, 
  hasMore = false 
}: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      {activities.length > 0 ? (
        <>
          {activities.map((activity) => {
            const { icon: Icon, bgColor } = activityTypeConfig[activity.type];
            const formattedDate = format(new Date(activity.timestamp), "MMM d, h:mm a");
            
            return (
              <div key={activity.id} className="flex items-start pb-4 border-b border-border">
                <div className={cn("h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-white", bgColor)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="ml-3">
                  <p className="text-sm">
                    {activity.title} <span className="font-medium text-foreground">{activity.entityName}</span>
                    {activity.points && (
                      <span className="font-medium text-foreground"> ({activity.points} points)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
                </div>
              </div>
            );
          })}
          
          {hasMore && (
            <Button 
              variant="ghost" 
              onClick={onLoadMore} 
              disabled={isLoading}
              className="mt-4 text-primary hover:text-primary/80 hover:bg-primary/10 w-full"
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          )}
        </>
      ) : (
        <p className="text-muted-foreground text-sm text-center py-4">No activity to display</p>
      )}
    </div>
  );
}
