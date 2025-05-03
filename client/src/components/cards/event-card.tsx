import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export type EventCardProps = {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  categories: string[];
  isRegistered?: boolean;
  onRegister?: (eventId: number) => void;
};

export default function EventCard({
  id,
  title,
  description,
  date,
  time,
  location,
  imageUrl,
  categories,
  isRegistered = false,
  onRegister
}: EventCardProps) {
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registered, setRegistered] = useState(isRegistered);
  
  const formattedDate = new Date(date);
  const monthAbbr = format(formattedDate, 'MMM').toUpperCase();
  const dayNum = format(formattedDate, 'd');

  const registerForEvent = async () => {
    if (registered) return;
    
    setIsRegistering(true);
    try {
      await apiRequest("POST", `/api/events/${id}/register`, {});
      setRegistered(true);
      
      toast({
        title: "Successfully registered",
        description: `You have registered for ${title}`,
        variant: "default",
      });
      
      if (onRegister) {
        onRegister(id);
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to register for event",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card className="overflow-hidden card-hover">
      <div className="h-40 bg-muted relative">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs font-medium px-2 py-1 rounded">
          {monthAbbr} {dayNum}
        </div>
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
          {time}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center mb-2 gap-2 flex-wrap">
          {categories.map((category, index) => (
            <Badge key={index} variant="outline" className="bg-muted text-muted-foreground">
              {category}
            </Badge>
          ))}
        </div>
        <h3 className="font-poppins font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="text-muted-foreground mr-1 h-4 w-4" />
            <span className="text-muted-foreground text-xs">{location}</span>
          </div>
          <Button
            size="sm"
            variant={registered ? "outline" : "default"}
            onClick={registerForEvent}
            disabled={isRegistering || registered}
            className={registered ? "bg-muted hover:bg-muted" : ""}
          >
            {registered ? "Registered" : "Register"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
