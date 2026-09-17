import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { supabase, TodoListItem } from "../lib/supabase";
import { toast } from "../hooks/use-toast";
import AttachmentList from "./AttachmentList";

interface FileAttachment {
  id?: string;
  attachmentId?: string;
  name?: string;
  originalName?: string;
  filename?: string;
  type?: string;
  fileType?: string;
  size?: number;
  fileSize?: number;
  url?: string;
  publicUrl?: string;
}

interface TodoItemProps {
  todo: TodoListItem;
  attachments?: FileAttachment[];
  onStatusChange?: (todoId: string, newStatus: string) => void;
  onCompleted?: () => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  attachments = [],
  onStatusChange,
  onCompleted,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(todo.status);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-50 border-l-4 border-l-gray-400";
      case "in_progress":
        return "bg-blue-50 border-l-4 border-l-blue-500";
      case "completed":
        return "bg-green-50 border-l-4 border-l-green-500";
      default:
        return "bg-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const updateData: Record<string, any> = {
        status: newStatus,
      };

      // If marking as completed, set completed_at
      if (newStatus === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("todo_list")
        .update(updateData)
        .eq("id", todo.id);

      if (error) throw error;

      setStatus(newStatus);
      onStatusChange?.(todo.id, newStatus);

      toast({
        title: "Updated",
        description:
          newStatus === "completed"
            ? "Task marked as completed! Great work!"
            : `Task moved to ${newStatus.replace("_", " ")}`,
      });

      if (newStatus === "completed") {
        onCompleted?.();
      }
    } catch (error) {
      console.error("Error updating todo status:", error);

      // Provide helpful error messages
      let errorMessage = "Failed to update todo";
      if (error instanceof Error) {
        if (error.message.includes("foreign key") || error.message.includes("23503")) {
          errorMessage = "There's a data consistency issue. Please try refreshing the page and try again.";
        } else if (error.message.includes("permission") || error.message.includes("RLS")) {
          errorMessage = "You don't have permission to update this task.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setStatus(todo.status);
    } finally {
      setIsUpdating(false);
    }
  };

  const isOverdue =
    todo.due_date && new Date(todo.due_date) < new Date() && status !== "completed";

  return (
    <Card className={`${getStatusColor(status)} hover:shadow-md transition-shadow`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-white rounded-lg flex-shrink-0 mt-1">
              {getStatusIcon(status)}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base text-sheraton-navy line-clamp-2">
                {todo.title}
              </CardTitle>
              {todo.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {todo.description}
                </p>
              )}
            </div>
          </div>
          <Badge className={`${getPriorityColor(todo.priority)} flex-shrink-0 ml-2`}>
            {todo.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {todo.due_date && (
            <div className="p-2 bg-white/60 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Due
              </p>
              <p className={`font-semibold ${isOverdue ? "text-red-600" : "text-gray-700"}`}>
                {new Date(todo.due_date).toLocaleDateString()}
              </p>
              {isOverdue && (
                <p className="text-xs text-red-600 font-semibold mt-1">
                  Overdue
                </p>
              )}
            </div>
          )}

          {todo.estimated_hours && (
            <div className="p-2 bg-white/60 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Est. Hours
              </p>
              <p className="font-semibold text-gray-700">
                {todo.estimated_hours.toFixed(1)}h
              </p>
            </div>
          )}

          {todo.details?.budget && (
            <div className="p-2 bg-white/60 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Budget
              </p>
              <p className="font-semibold text-green-700">
                ${todo.details.budget.toFixed(2)}
              </p>
            </div>
          )}

          {todo.details?.category && (
            <div className="p-2 bg-white/60 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Category
              </p>
              <p className="font-semibold text-gray-700 capitalize">
                {todo.details.category}
              </p>
            </div>
          )}
        </div>

        {/* Task Details from Original Task */}
        {todo.details && (
          <div className="p-3 bg-white/70 rounded border border-gray-200 space-y-2">
            {todo.details.estimated_time && (
              <div className="text-sm">
                <span className="font-semibold text-gray-600">Estimated Time: </span>
                <span className="text-gray-700">{todo.details.estimated_time}</span>
              </div>
            )}

            {todo.details.payment_terms && (
              <div className="text-sm">
                <span className="font-semibold text-gray-600">Payment Terms: </span>
                <span className="text-gray-700">{todo.details.payment_terms}</span>
              </div>
            )}
          </div>
        )}

        {/* Attachments Section */}
        {attachments && attachments.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
              📎 Attachments ({attachments.length})
            </p>
            <AttachmentList attachments={attachments} compact={true} />
          </div>
        )}

        {/* Status Update Section */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Task Status
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating || status === "completed"}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-gray-500" />
                      <span>Pending</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>In Progress</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {isUpdating && (
                <Loader className="h-4 w-4 animate-spin text-sheraton-gold" />
              )}
            </div>

            {status !== "completed" && (
              <p className="text-xs text-gray-500 italic">
                Once you complete the work, use the Reports tab to submit evidence and request approval from the manager.
              </p>
            )}
          </div>
        </div>

        {/* Completion Info */}
        {status === "completed" && todo.completed_at && (
          <div className="p-3 bg-green-100/50 rounded border border-green-300 text-sm">
            <p className="text-green-800 font-semibold">
              ✓ Completed on {new Date(todo.completed_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodoItem;
