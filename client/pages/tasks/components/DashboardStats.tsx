import React from "react";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import StatsCard from "./StatsCard";

// Re-export for convenience

interface DashboardStatsProps {
  stats: {
    open: number;
    urgent: number;
    completedToday: number;
    awaitingChat: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatsCard
        label="Open Tasks"
        value={stats.open}
        icon={Clock}
        iconColor="text-blue-500"
        cardBorder="border-l-4 border-l-blue-500 sheraton-gradient text-white"
        isGradient={true}
      />

      <StatsCard
        label="Urgent Tasks"
        value={stats.urgent}
        icon={AlertCircle}
        iconColor="text-red-500"
        cardBorder="border-l-4 border-l-red-500"
        textColor="text-red-600"
      />

      <StatsCard
        label="Completed Today"
        value={stats.completedToday}
        icon={CheckCircle}
        iconColor="text-green-500"
        cardBorder="border-l-4 border-l-green-500"
        textColor="text-green-600"
      />

      <StatsCard
        label="Active Chats"
        value={stats.awaitingChat}
        icon={MessageSquare}
        iconColor="text-sheraton-gold"
        cardBorder="border-l-4 border-l-sheraton-gold"
        textColor="text-sheraton-gold"
      />
    </div>
  );
};

export default DashboardStats;
