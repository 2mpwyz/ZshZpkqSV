import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  cardBorder: string;
  textColor?: string;
  isGradient?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon: Icon,
  iconColor,
  cardBorder,
  textColor = "",
  isGradient = false,
}) => {
  const CardClass = isGradient
    ? "border-l-4 sheraton-gradient text-white"
    : cardBorder;

  return (
    <Card className={CardClass}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${isGradient ? "opacity-90" : "text-muted-foreground"} mb-1`}>
              {label}
            </p>
            <p className={`text-3xl font-bold ${textColor || ""}`}>{value}</p>
          </div>
          <Icon className={`h-10 w-10 ${iconColor} opacity-30`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
