import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconClass: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
};

export default function StatCard({ title, value, icon, iconClass, trend }: StatCardProps) {
  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            <h3 className="font-poppins font-semibold text-2xl mt-1">{value}</h3>
          </div>
          <div className={cn("p-2 rounded-lg", iconClass)}>
            {icon}
          </div>
        </div>
        
        {trend && (
          <div className={cn(
            "mt-4 flex items-center text-sm",
            trend.isPositive ? "text-[#10B981]" : "text-destructive"
          )}>
            {trend.isPositive ? 
              <TrendingUp className="h-4 w-4 mr-1" /> : 
              <TrendingDown className="h-4 w-4 mr-1" />
            }
            <span>{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
