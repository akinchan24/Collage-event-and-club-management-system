import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
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

const clubIcons: Record<string, React.ReactNode> = {
  coding: <Code className="h-5 w-5 text-white" />,
  chess: <Swords className="h-5 w-5 text-white" />,
  music: <Music className="h-5 w-5 text-white" />,
  basketball: <Volleyball className="h-5 w-5 text-white" />,
  art: <Pencil className="h-5 w-5 text-white" />,
  literature: <BookOpen className="h-5 w-5 text-white" />,
  photography: <Camera className="h-5 w-5 text-white" />,
  volunteer: <Heart className="h-5 w-5 text-white" />,
  international: <Globe className="h-5 w-5 text-white" />
};

const clubColors: Record<string, string> = {
  coding: "bg-primary",
  chess: "bg-secondary",
  music: "bg-accent",
  basketball: "bg-destructive",
  art: "bg-[#10B981]",
  literature: "bg-[#F59E0B]",
  photography: "bg-[#3B82F6]",
  volunteer: "bg-[#EC4899]",
  international: "bg-[#8B5CF6]"
};

export type ClubCardProps = {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  nextMeeting?: string;
  isMember?: boolean;
  onJoin?: (clubId: number) => void;
};

export default function ClubCard({
  id,
  name,
  description,
  memberCount,
  category,
  nextMeeting,
  isMember = false,
  onJoin
}: ClubCardProps) {
  const { toast } = useToast();
  const [isJoining, setIsJoining] = useState(false);
  const [joined, setJoined] = useState(isMember);

  const iconKey = category.toLowerCase();
  const clubIcon = clubIcons[iconKey] || <Code className="h-5 w-5 text-white" />;
  const clubColor = clubColors[iconKey] || "bg-primary";

  const handleJoinClub = async () => {
    if (joined) return;
    
    setIsJoining(true);
    try {
      await apiRequest("POST", `/api/clubs/${id}/join`, {});
      setJoined(true);
      
      toast({
        title: "Successfully joined",
        description: `You have joined ${name}`,
        variant: "default",
      });
      
      if (onJoin) {
        onJoin(id);
      }
    } catch (error) {
      toast({
        title: "Failed to join club",
        description: error instanceof Error ? error.message : "Failed to join club",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="p-4 card-hover">
      <CardContent className="p-0">
        <div className="flex items-center mb-3">
          <div className={`h-10 w-10 rounded-full ${clubColor} flex items-center justify-center mr-3`}>
            {clubIcon}
          </div>
          <div>
            <h3 className="font-poppins font-semibold text-base">{name}</h3>
            <p className="text-muted-foreground text-xs">{memberCount} members</p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{description}</p>
        {nextMeeting && (
          <div className="mb-2 text-xs flex items-center justify-between">
            <span className="text-muted-foreground">Next Meeting:</span>
            <span className="text-foreground font-medium">{nextMeeting}</span>
          </div>
        )}
        <Button
          variant={joined ? "outline" : "secondary"}
          size="sm"
          className="w-full"
          onClick={handleJoinClub}
          disabled={isJoining || joined}
        >
          {joined ? "Member" : "Join Club"}
        </Button>
      </CardContent>
    </Card>
  );
}
