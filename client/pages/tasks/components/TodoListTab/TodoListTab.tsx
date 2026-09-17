import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  CheckSquare,
  PlusCircle,
  MessageSquare,
  Filter,
  Grid3x3,
  List,
  Search,
  AlertCircle,
  Tag,
} from "lucide-react";
import { supabase, Task as TaskType, TaskResponse, TaskProposal, TodoListItem, UserProfile, FileAttachment } from "../../../../lib/supabase";
import { toast } from "../../../../hooks/use-toast";
import AttachmentList from "../../../../components/AttachmentList";
import ServiceProviderProposalReview from "../../../../components/ServiceProviderProposalReview";
import ManagerProposalReview from "../../../../components/ManagerProposalReview";
import TodoItem from "../../../../components/TodoItem";
import { getPriorityColor, getStatusColor, getStatusLabel } from "../../utils/taskDisplay";
import StatusIcon from "../StatusIcon";

interface TodoListTabProps {
  userRole: "guest" | "manager" | "service_provider" | null;
  currentUserProfile: UserProfile | null;
  tasks: TaskType[];
  taskResponses: TaskResponse[];
  taskProposals: TaskProposal[];
  todoItems: TodoListItem[];
  taskAttachments: Map<string, FileAttachment[]>;
  todoAttachments: Map<string, FileAttachment[]>;
  searchQuery: string;
  filterStatus: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (status: string) => void;
  onTaskSelect: (taskId: string) => void;
  onTabChange: (tab: string) => void;
  onProposalUpdated: () => void;
  onTodoUpdated: () => void;
  onTaskResponseOpen: (task: TaskType) => void;
  isSubmitting: boolean;
}

const TodoListTab: React.FC<TodoListTabProps> = ({
  userRole,
  currentUserProfile,
  tasks,
  taskResponses,
  taskProposals,
  todoItems,
  taskAttachments,
  todoAttachments,
  searchQuery,
  filterStatus,
  onSearchChange,
  onFilterChange,
  onTaskSelect,
  onTabChange,
  onProposalUpdated,
  onTodoUpdated,
  onTaskResponseOpen,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Helper: Get tasks assigned to current service provider that have no response yet
  const getUnrespondedAssignedTasks = () => {
    if (!currentUserProfile || userRole !== "service_provider") return [];

    const unresponded = tasks.filter((task) => {
      const isAssignedToMe = task.assigned_to === currentUserProfile.id;
      if (!isAssignedToMe) return false;

      const hasResponse = taskResponses.some(
        (response) =>
          response.task_id === task.id &&
          response.provider_id === currentUserProfile.id
      );

      return !hasResponse;
    });

    // Log attachment status for debugging
    unresponded.forEach((task) => {
      const attachments = taskAttachments.get(task.id);
      if (!attachments || attachments.length === 0) {
        console.debug(
          `[getUnrespondedAssignedTasks] Task ${task.id} has no cached attachments`,
          { taskId: task.id, hasCachedAttachments: attachments?.length ?? 0 }
        );
      }
    });

    return unresponded;
  };

  // Helper: Get pending proposals for current service provider
  const getPendingProposalsForProvider = () => {
    if (!currentUserProfile || userRole !== "service_provider") return [];

    return taskProposals.filter((proposal) => {
      const isForMe = proposal.provider_id === currentUserProfile.id;
      const isActive = proposal.status === "pending" || proposal.status === "counter_proposed";
      return isForMe && isActive;
    });
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (userRole === "service_provider") {
    return (
      <div className="space-y-6">
        {/* SECTION 1: AWAITING YOUR RESPONSE */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <div>
              <h2 className="text-2xl font-bold text-sheraton-navy">Awaiting Your Response</h2>
              <p className="text-sm text-gray-600">Tasks assigned to you - accept, decline, or propose</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {getUnrespondedAssignedTasks().map((task) => (
              <Card
                key={task.id}
                className="border-2 border-orange-200 bg-orange-50 hover:shadow-lg transition-shadow overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-orange-200">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-white rounded-lg flex-shrink-0">
                        <StatusIcon status={task.status} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-sheraton-gold uppercase tracking-wide mb-1">
                          {task.id}
                        </p>
                        <h3 className="font-semibold text-sheraton-navy line-clamp-2">
                          {task.title}
                        </h3>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                    {task.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {task.due_date && (
                      <div className="p-2 bg-white rounded border border-orange-200">
                        <p className="text-xs text-gray-500 font-semibold mb-1">DUE</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {(task as any).budget && (
                      <div className="p-2 bg-white rounded border border-orange-200">
                        <p className="text-xs text-gray-500 font-semibold mb-1">BUDGET</p>
                        <p className="text-sm font-semibold text-green-700">
                          ${(task as any).budget.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  {taskAttachments.get(task.id) && taskAttachments.get(task.id)!.length > 0 && (
                    <div className="mb-4 p-3 bg-white rounded border border-orange-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2">ATTACHMENTS</p>
                      <div className="space-y-1">
                        {taskAttachments.get(task.id)!.map((attachment) => (
                          <a
                            key={attachment.attachmentId}
                            href={attachment.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-sheraton-gold hover:underline block truncate"
                            title={attachment.filename || attachment.originalName}
                          >
                            📎 {attachment.filename || attachment.originalName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => onTaskResponseOpen(task)}
                    className="w-full sheraton-gradient text-white"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Respond to Task
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {getUnrespondedAssignedTasks().length === 0 && (
            <Card className="border-2 border-dashed border-orange-300 bg-orange-50/50">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-4 opacity-50" />
                <p className="text-gray-600">No tasks awaiting your response</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* DIVIDER */}
        <div className="border-t-2 border-gray-200 my-8 pt-8"></div>

        {/* SECTION 1B: PENDING PROPOSALS */}
        {getPendingProposalsForProvider().length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-sheraton-navy">
                  Proposal Responses & Negotiations
                </h2>
                <p className="text-sm text-gray-600">
                  Manager responses to your proposals - review and respond
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getPendingProposalsForProvider().map((proposal) => {
                const task = tasks.find((t) => t.id === proposal.task_id);

                return (
                  <ServiceProviderProposalReview
                    key={proposal.id}
                    proposal={proposal}
                    taskTitle={task?.title || "Unknown Task"}
                    managerName="Manager"
                    task={task}
                    currentUserId={""}
                    currentUserProfileId={currentUserProfile?.id}
                    onProposalUpdated={onProposalUpdated}
                  />
                );
              })}
            </div>

            <div className="border-t-2 border-gray-200 my-8"></div>
          </div>
        )}

        {/* SECTION 2: YOUR ACCEPTED TASKS */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <CheckSquare className="h-6 w-6 text-sheraton-gold" />
            <div>
              <h2 className="text-2xl font-bold text-sheraton-navy">Your Accepted Tasks</h2>
              <p className="text-sm text-gray-600">Tasks you've accepted - manage your workload</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Select value={filterStatus} onValueChange={onFilterChange}>
              <SelectTrigger className="w-40 border-gray-200">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {todoItems
              .filter((todo) => filterStatus === "all" || todo.status === filterStatus)
              .map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  attachments={todoAttachments.get(todo.id) || []}
                  onStatusChange={onTodoUpdated}
                />
              ))}
          </div>

          {todoItems.length === 0 && (
            <Card className="border-2 border-dashed border-sheraton-gold bg-sheraton-cream">
              <CardContent className="p-12 text-center">
                <div className="flex justify-center mb-6">
                  <CheckSquare className="h-16 w-16 text-sheraton-gold opacity-40" />
                </div>
                <h3 className="text-xl font-semibold text-sheraton-navy mb-2">No accepted tasks yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  When you accept a task from the section above, it will appear here for you to manage
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Manager View
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 flex gap-2 w-full md:w-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-gray-200"
            />
          </div>

          <Select value={filterStatus} onValueChange={onFilterChange}>
            <SelectTrigger className="w-40 border-gray-200">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 border-l pl-4">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "sheraton-gradient text-white" : ""}
            title="Grid view"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "sheraton-gradient text-white" : ""}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PENDING PROPOSALS SECTION - Manager View */}
      {taskProposals.some((p) => p.status === "pending") && (
        <div className="space-y-4 my-8">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-sheraton-navy">Pending Proposals</h2>
              <p className="text-sm text-gray-600">
                {taskProposals.filter((p) => p.status === "pending").length} proposal(s) awaiting your review
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {taskProposals
              .filter((p) => p.status === "pending")
              .map((proposal) => {
                const task = tasks.find((t) => t.id === proposal.task_id);

                return (
                  <ManagerProposalReview
                    key={proposal.id}
                    proposal={proposal}
                    taskTitle={task?.title || "Unknown Task"}
                    providerName={task?.assignee_name || "Unknown Provider"}
                    onProposalUpdated={onProposalUpdated}
                  />
                );
              })}
          </div>
        </div>
      )}

      {taskProposals.some((p) => p.status === "pending") && (
        <div className="border-t-2 border-gray-200 my-8"></div>
      )}

      {/* Tasks Display */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            : "space-y-4"
        }
      >
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            className={`${getStatusColor(task.status)} hover:shadow-lg transition-shadow overflow-hidden`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4 pb-4 border-b">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-white rounded-lg flex-shrink-0">
                    <StatusIcon status={task.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold text-sheraton-gold uppercase tracking-wide">
                        {task.id}
                      </p>
                      {(task as any).is_from_complaint && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          From Complaint
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-sheraton-navy mt-1 line-clamp-2 hover:text-sheraton-gold transition-colors">
                      {task.title}
                    </h3>
                  </div>
                </div>
                <Badge className={`${getPriorityColor(task.priority)} font-semibold flex-shrink-0 ml-2`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {task.description}
              </p>

              <div className="space-y-3 mb-5 text-sm">
                {task.category && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs font-medium">CATEGORY</span>
                    <span className="font-semibold text-gray-900 capitalize">{task.category}</span>
                  </div>
                )}
                {task.assignee_name && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs font-medium">ASSIGNED TO</span>
                    <span className="font-semibold text-gray-900">{task.assignee_name}</span>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs font-medium">DUE DATE</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {task.estimated_time && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs font-medium">EST. TIME</span>
                    <span className="font-semibold text-gray-900">{task.estimated_time}</span>
                  </div>
                )}
                {(task as any).budget && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs font-medium">BUDGET</span>
                    <span className="font-semibold text-green-700">${parseFloat((task as any).budget).toFixed(2)}</span>
                  </div>
                )}
                {task.assigned_category && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs font-medium">TYPE</span>
                    <Badge
                      className={
                        task.assigned_category === "internal"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }
                    >
                      {task.assigned_category === "internal" ? "Internal" : "External"}
                    </Badge>
                  </div>
                )}
                {taskAttachments.get(task.id) && taskAttachments.get(task.id)!.length > 0 && (
                  <div className="pt-2 border-t mt-3">
                    <AttachmentList
                      attachments={taskAttachments.get(task.id)!}
                      compact={true}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t flex-wrap">
                <Badge variant="outline" className="bg-white">
                  {getStatusLabel(task.status)}
                </Badge>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onTaskSelect(task.id);
                    onTabChange("live-chat");
                  }}
                  className="ml-auto hover:bg-sheraton-gold hover:text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="col-span-full border-2 border-dashed border-sheraton-gold bg-sheraton-cream">
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <CheckSquare className="h-16 w-16 text-sheraton-gold opacity-40" />
            </div>
            <h3 className="text-xl font-semibold text-sheraton-navy mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Try adjusting your search or filters, or create a new task to get started
            </p>
            <Button
              onClick={() => onTabChange("new-task")}
              className="sheraton-gradient text-white"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Task
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TodoListTab;
