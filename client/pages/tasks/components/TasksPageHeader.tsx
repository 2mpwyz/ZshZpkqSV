import React from "react";
import { CheckSquare } from "lucide-react";
import { Badge } from "../../../components/ui/badge";

interface TasksPageHeaderProps {
  title?: string;
  subtitle?: string;
}

const TasksPageHeader: React.FC<TasksPageHeaderProps> = ({
  title = "Task Management System",
  subtitle = "Create, assign, and track tasks efficiently",
}) => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-4">
        <CheckSquare className="h-8 w-8 text-sheraton-gold mr-2" />
        <Badge className="bg-sheraton-gold text-sheraton-navy px-4 py-2">
          Task Management
        </Badge>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-sheraton-navy mb-4">
        {title}
      </h1>
      <p className="text-lg text-muted-foreground">{subtitle}</p>
    </div>
  );
};

export default TasksPageHeader;
