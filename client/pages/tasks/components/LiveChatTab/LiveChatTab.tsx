import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import {
  CheckSquare,
  MessageSquare,
} from "lucide-react";
import { Task as TaskType, UserProfile } from "../../../../lib/supabase";
import TaskChat from "../../../../components/TaskChat";
import { getPriorityColor, getStatusLabel } from "../../utils/taskDisplay";

interface LiveChatTabProps {
  selectedTask: string | null;
  tasks: TaskType[];
  currentUser: any;
  currentUserProfile: UserProfile | null;
  userRole: "guest" | "manager" | "service_provider" | null;
  onTaskSelect: (taskId: string) => void;
  onTabChange: (tab: string) => void;
}

const LiveChatTab: React.FC<LiveChatTabProps> = ({
  selectedTask,
  tasks,
  currentUser,
  currentUserProfile,
  userRole,
  onTaskSelect,
  onTabChange,
}) => {
  const currentTaskData = tasks.find((t) => t.id === selectedTask);

  if (!selectedTask || !currentTaskData) {
    return (
      <Card className="border-2 border-dashed border-sheraton-gold bg-sheraton-cream">
        <CardContent className="p-12 text-center">
          <div className="flex justify-center mb-6">
            <MessageSquare className="h-16 w-16 text-sheraton-gold opacity-40" />
          </div>
          <h3 className="text-xl font-semibold text-sheraton-navy mb-2">
            Select a task to view chat
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Click "Chat" on any task from the Task List tab to start or view conversations
          </p>
          <Button
            onClick={() => onTabChange("todo-list")}
            className="sheraton-gradient text-white"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Go to Task List
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
      {/* Chat Area */}
      {currentUser && userRole && (
        <TaskChat
          taskId={selectedTask}
          currentUserId={currentUser.id}
          currentUserRole={userRole as "manager" | "service_provider"}
          taskStatus={currentTaskData?.status || ""}
          otherPartyName={
            userRole === "manager"
              ? currentTaskData?.assignee_name || "Provider"
              : currentTaskData?.title || "Manager"
          }
        />
      )}

      {/* Task Details Sidebar */}
      <Card className="bg-gradient-to-b from-sheraton-cream to-white border-sheraton-gold">
        <CardHeader>
          <CardTitle className="text-sheraton-navy">Task Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          {currentTaskData && (
            <>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  ID
                </p>
                <p className="font-semibold text-sheraton-navy font-mono">
                  {currentTaskData.id}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Priority
                </p>
                <Badge className={`${getPriorityColor(currentTaskData.priority)} font-semibold`}>
                  {currentTaskData.priority.charAt(0).toUpperCase() +
                    currentTaskData.priority.slice(1)}
                </Badge>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Assigned To
                </p>
                <p className="font-semibold text-sheraton-navy">
                  {currentTaskData.assignee_name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Due Date
                </p>
                <p className="font-semibold text-sheraton-navy">
                  {currentTaskData.due_date
                    ? new Date(currentTaskData.due_date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Status
                </p>
                <Badge variant="outline" className="bg-white">
                  {getStatusLabel(currentTaskData.status)}
                </Badge>
              </div>

              {currentTaskData.category && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Category
                  </p>
                  <p className="font-semibold text-sheraton-navy capitalize">
                    {currentTaskData.category}
                  </p>
                </div>
              )}

              {(currentTaskData as any).budget && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Budget
                  </p>
                  <p className="font-semibold text-green-700">
                    ${parseFloat((currentTaskData as any).budget).toFixed(2)}
                  </p>
                </div>
              )}

              {currentTaskData.estimated_time && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Est. Time
                  </p>
                  <p className="font-semibold text-sheraton-navy">
                    {currentTaskData.estimated_time}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Description
                </p>
                <p className="text-gray-700 text-xs">
                  {currentTaskData.description}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveChatTab;
