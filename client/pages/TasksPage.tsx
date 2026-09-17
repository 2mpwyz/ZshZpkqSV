import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { supabase, Task as TaskType, Complaint, TaskResponse, TaskProposal, TodoListItem, UserProfile } from "../lib/supabase";
import { toast } from "../hooks/use-toast";
import { FileAttachment } from "../components/FileUploadZone";
import { useFileUpload } from "../hooks/useFileUpload";
import TaskResponseModal from "../components/TaskResponseModal";

// Import refactored sub-components
import TasksPageHeader from "./tasks/components/TasksPageHeader";
import DashboardStats from "./tasks/components/DashboardStats";
import TabsNavigation from "./tasks/components/TabsNavigation";
import NewTaskTab from "./tasks/components/NewTaskTab/NewTaskTab";
import TodoListTab from "./tasks/components/TodoListTab/TodoListTab";
import LiveChatTab from "./tasks/components/LiveChatTab/LiveChatTab";
import ReportsTab from "./tasks/components/ReportsTab/ReportsTab";

interface TaskUI extends TaskType {
  category?: "operations" | "service" | "training" | "maintenance";
  assignedTo?: string;
  dueDate?: string;
  createdAt?: string;
  estimatedTime?: string;
  checklist?: string[];
}

interface Message {
  id: string;
  taskId: string;
  author: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

const TasksPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { linkToTask, getTaskAttachments, getComplaintAttachments } = useFileUpload();

  // Determine active tab from URL path
  const getTabFromPath = () => {
    if (location.pathname.includes("/tasks/list")) return "todo-list";
    if (location.pathname.includes("/tasks/chat")) return "live-chat";
    if (location.pathname.includes("/tasks/reports")) return "reports";
    return "new-task";
  };

  // ========== STATE MANAGEMENT ==========
  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [taskAttachments, setTaskAttachments] = useState<Map<string, FileAttachment[]>>(new Map());

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    category: "",
    assignmentType: "",
    assignee: "",
    dueDate: "",
    estimatedTime: "",
    paymentTerms: "",
    budget: "",
    checklist: [] as string[],
    evidenceTypes: [] as string[],
  });

  // File attachments state
  const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([]);

  // Data state
  const [tasks, setTasks] = useState<TaskUI[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<"guest" | "manager" | "service_provider" | null>(null);
  const [internalStaff, setInternalStaff] = useState<any[]>([]);
  const [externalVendors, setExternalVendors] = useState<any[]>([]);

  // Task responses and proposals
  const [taskResponses, setTaskResponses] = useState<TaskResponse[]>([]);
  const [taskProposals, setTaskProposals] = useState<TaskProposal[]>([]);
  const [todoItems, setTodoItems] = useState<TodoListItem[]>([]);

  // Attachments state
  const [complaintAttachments, setComplaintAttachments] = useState<Map<string, FileAttachment[]>>(new Map());
  const [todoAttachments, setTodoAttachments] = useState<Map<string, FileAttachment[]>>(new Map());

  // Modal states
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedTaskForResponse, setSelectedTaskForResponse] = useState<TaskUI | null>(null);

  // ========== SYNC URL WITH TAB CHANGES ==========
  useEffect(() => {
    const newTab = getTabFromPath();
    setActiveTab(newTab);
    setFilterStatus("all");
  }, [location.pathname]);

  // ========== LOAD TODOS ==========
  useEffect(() => {
    if (currentUserProfile && userRole === "service_provider") {
      supabase
        .from("todo_list")
        .select("*")
        .eq("provider_id", currentUserProfile.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setTodoItems(data || []));
    }
  }, [currentUserProfile, userRole]);

  // ========== LOAD TASK ATTACHMENTS WHEN TASKS CHANGE ==========
  useEffect(() => {
    const loadTaskAttachmentsCached = async () => {
      if (!tasks || tasks.length === 0) return;

      setTaskAttachments((prevMap) => {
        const newMap = new Map(prevMap);
        let tasksToLoad = 0;

        // Only load attachments for tasks that don't have cached attachments yet
        for (const task of tasks) {
          if (!newMap.has(task.id)) {
            tasksToLoad++;
          }
        }

        if (tasksToLoad === 0) {
          // All tasks already have cached attachments
          return prevMap;
        }

        // Load attachments in background without blocking UI
        (async () => {
          for (const task of tasks) {
            if (!newMap.has(task.id)) {
              const attachments = await getTaskAttachments(task.id);
              newMap.set(task.id, attachments as FileAttachment[]);
              // Update state incrementally
              setTaskAttachments(new Map(newMap));
            }
          }
        })();

        return prevMap;
      });
    };

    loadTaskAttachmentsCached();
  }, [tasks, getTaskAttachments]);

  // ========== LOAD TODO ATTACHMENTS ==========
  useEffect(() => {
    const loadTodoAttachments = async () => {
      if (!todoItems || todoItems.length === 0) return;

      setTodoAttachments((prevMap) => {
        const newMap = new Map(prevMap);
        let todosToLoad = 0;

        // Only load attachments for todos that don't have cached attachments yet
        for (const todo of todoItems) {
          if (!newMap.has(todo.id)) {
            todosToLoad++;
          }
        }

        if (todosToLoad === 0) {
          // All todos already have cached attachments
          return prevMap;
        }

        // Load attachments in background without blocking UI
        (async () => {
          for (const todo of todoItems) {
            if (!newMap.has(todo.id)) {
              const attachments = await getTaskAttachments(todo.task_id);
              newMap.set(todo.id, attachments as FileAttachment[]);
              // Update state incrementally
              setTodoAttachments(new Map(newMap));
            }
          }
        })();

        return prevMap;
      });
    };

    loadTodoAttachments();
  }, [todoItems, getTaskAttachments]);

  // ========== SUBSCRIBE TO REALTIME UPDATES ==========
  useEffect(() => {
    // Subscribe to tasks for real-time updates
    const tasksSubscription = supabase
      .channel("tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        () => {
          supabase
            .from("tasks")
            .select("*")
            .order("created_at", { ascending: false })
            .then(({ data }) => setTasks(data || []));
        }
      )
      .subscribe();

    // Subscribe to task responses
    const responsesSubscription = supabase
      .channel("task_responses")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_responses",
        },
        () => {
          supabase
            .from("task_responses")
            .select("*")
            .order("created_at", { ascending: false })
            .then(({ data }) => setTaskResponses(data || []));
        }
      )
      .subscribe();

    // Subscribe to task proposals
    const proposalsSubscription = supabase
      .channel("task_proposals")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_proposals",
        },
        () => {
          supabase
            .from("task_proposals")
            .select("*")
            .order("created_at", { ascending: false })
            .then(({ data }) => setTaskProposals(data || []));
        }
      )
      .subscribe();

    // Subscribe to todo list changes
    let todosSubscription: any = null;
    if (currentUserProfile && userRole === "service_provider") {
      todosSubscription = supabase
        .channel(`todo_list_${currentUserProfile.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "todo_list",
            filter: `provider_id=eq.${currentUserProfile.id}`,
          },
          () => {
            supabase
              .from("todo_list")
              .select("*")
              .eq("provider_id", currentUserProfile.id)
              .order("created_at", { ascending: false })
              .then(({ data }) => setTodoItems(data || []));
          }
        )
        .subscribe();
    }

    return () => {
      tasksSubscription?.unsubscribe();
      responsesSubscription?.unsubscribe();
      proposalsSubscription?.unsubscribe();
      todosSubscription?.unsubscribe();
    };
  }, [currentUserProfile, userRole]);

  // ========== LOAD INITIAL DATA ==========
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user);

        let profileData: any = null;

        // Get current user's profile and role
        if (user) {
          const { data: fetchedProfileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

          // Profile error handled - user may not have profile created yet

          if (fetchedProfileData) {
            profileData = fetchedProfileData;
            setCurrentUserProfile(fetchedProfileData);
            setUserRole(fetchedProfileData.role as "guest" | "manager" | "service_provider");
          }
        }

        // Load internal staff
        const { data: internalData, error: internalError } = await supabase
          .from("user_profiles")
          .select("id, email, first_name, last_name, service_type, role")
          .eq("service_category", "internal");

        if (internalError) throw internalError;
        setInternalStaff(internalData || []);

        // Load external vendors
        const { data: externalData, error: externalError } = await supabase
          .from("user_profiles")
          .select("id, email, first_name, last_name, service_type, role")
          .eq("service_category", "external");

        if (externalError) throw externalError;
        setExternalVendors(externalData || []);

        // Load complaints
        const { data: complaintsData, error: complaintsError } = await supabase
          .from("complaints")
          .select("*")
          .eq("status", "open")
          .order("created_at", { ascending: false });

        if (complaintsError) throw complaintsError;
        setComplaints(complaintsData || []);

        // Load attachments for all complaints
        if (complaintsData && complaintsData.length > 0) {
          const complaintAttachmentsMap = new Map<string, FileAttachment[]>();

          for (const complaint of complaintsData) {
            const attachments = await getComplaintAttachments(complaint.id);
            complaintAttachmentsMap.set(complaint.id, attachments as FileAttachment[]);
          }

          setComplaintAttachments(complaintAttachmentsMap);
        }

        // Load tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (tasksError) throw tasksError;
        setTasks(tasksData || []);

        // Load task responses
        const { data: responsesData } = await supabase
          .from("task_responses")
          .select("*")
          .order("created_at", { ascending: false });
        setTaskResponses(responsesData || []);

        // Load task proposals
        const { data: proposalsData } = await supabase
          .from("task_proposals")
          .select("*")
          .order("created_at", { ascending: false });
        setTaskProposals(proposalsData || []);

        // Load todo list items
        if (user && profileData && profileData.role === "service_provider") {
          const { data: todosData, error: todosError } = await supabase
            .from("todo_list")
            .select("*")
            .eq("provider_id", profileData.id)
            .order("created_at", { ascending: false });

          // Todos error handled - may not have todos yet

          setTodoItems(todosData || []);
        }

        // Load attachments for all tasks
        if (tasksData && tasksData.length > 0) {
          const attachmentsMap = new Map<string, FileAttachment[]>();

          for (const task of tasksData) {
            const attachments = await getTaskAttachments(task.id);
            attachmentsMap.set(task.id, attachments as FileAttachment[]);
          }

          setTaskAttachments(attachmentsMap);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load tasks and complaints",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getTaskAttachments, getComplaintAttachments]);

  // ========== EVENT HANDLERS ==========
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "new-task") navigate("/tasks/new");
    else if (tab === "todo-list") navigate("/tasks/list");
    else if (tab === "live-chat") navigate("/tasks/chat");
  };

  const handleFormChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectComplaint = async (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setFormData((prev) => ({
      ...prev,
      title: `Address: ${complaint.complaint_type} - ${complaint.room_number}`,
      description: complaint.description,
      priority: complaint.priority as any,
    }));

    try {
      const complaintAttachments = await getComplaintAttachments(complaint.id);
      if (complaintAttachments && complaintAttachments.length > 0) {
        setFileAttachments(complaintAttachments as FileAttachment[]);
      }
    } catch (error) {
      console.error("Error loading complaint attachments:", error);
    }
  };

  const handleAcceptComplaint = async (complaint: Complaint) => {
    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from("complaints")
        .update({ status: "acknowledged" })
        .eq("id", complaint.id);

      if (updateError) throw updateError;

      if (complaint.user_id) {
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert([
            {
              user_id: complaint.user_id,
              complaint_id: complaint.id,
              type: "complaint_acknowledged",
              message: "Your complaint has been received. Help is on the way!",
              is_read: false,
            },
          ]);

        if (notificationError) {
          console.error("Failed to create notification:", notificationError);
        }
      }

      await handleSelectComplaint(complaint);

      setComplaints((prev) => prev.filter((c) => c.id !== complaint.id));

      toast({
        title: "Success",
        description: "Complaint acknowledged. Guest has been notified.",
      });

      setTimeout(() => {
        const formElement = document.querySelector('[data-task-form]');
        if (formElement) {
          formElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (error) {
      console.error("Error accepting complaint:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to acknowledge complaint",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTask = async () => {
    if (!formData.title || !formData.priority || !formData.assignmentType || !formData.assignee) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const assignees = formData.assignmentType === "internal" ? internalStaff : externalVendors;
      const selectedAssignee = assignees.find(
        (a) => `${a.first_name} ${a.last_name} - ${a.service_type}` === formData.assignee ||
               `${a.email}` === formData.assignee
      );

      const taskData = {
        complaint_id: selectedComplaint?.id || null,
        title: formData.title,
        description: formData.description,
        priority: formData.priority as "low" | "medium" | "high" | "urgent",
        category: (formData.category as "operations" | "service" | "training" | "maintenance") || null,
        status: "todo",
        assigned_to: selectedAssignee?.id || null,
        assignee_name: formData.assignee,
        assigned_category: formData.assignmentType as "internal" | "external",
        due_date: formData.dueDate || null,
        estimated_time: formData.estimatedTime || null,
        payment_terms: formData.paymentTerms || null,
        is_from_complaint: selectedComplaint !== null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        created_by: currentUser?.id,
      };

      const { data: createdTask, error: taskError } = await supabase
        .from("tasks")
        .insert([taskData])
        .select()
        .single();

      if (taskError) throw taskError;

      if (createdTask) {
        // Save checklist items if provided
        if (formData.checklist.length > 0) {
          const checklistData = {
            task_id: createdTask.id,
            title: "Task Checklist",
            description: "Checklist for task completion",
            is_required: true,
          };

          const { data: createdChecklist, error: checklistError } = await supabase
            .from("task_checklists")
            .insert([checklistData])
            .select()
            .single();

          if (!checklistError && createdChecklist) {
            // Insert checklist items
            const checklistItems = formData.checklist
              .filter((item) => item.trim())
              .map((item, index) => ({
                checklist_id: createdChecklist.id,
                label: item,
                description: "",
                display_order: index,
              }));

            if (checklistItems.length > 0) {
              await supabase.from("task_checklist_items").insert(checklistItems);
            }
          }
        }

        // Save evidence requirements if provided
        if (formData.evidenceTypes.length > 0) {
          const evidenceData = {
            task_id: createdTask.id,
            required_evidence_types: formData.evidenceTypes,
            description: "Required evidence types for task completion",
          };

          await supabase.from("task_evidence_requirements").insert([evidenceData]);
        }

        // Link attachments
        if (fileAttachments.length > 0) {
          const linkResults = [];
          for (const attachment of fileAttachments) {
            const success = await linkToTask(attachment.attachmentId, createdTask.id);
            linkResults.push({ attachmentId: attachment.attachmentId, success });
            if (!success) {
              console.warn(`[handleCreateTask] Failed to link attachment ${attachment.attachmentId}`);
            }
          }

          const failedCount = linkResults.filter(r => !r.success).length;
          if (failedCount > 0) {
            console.error(`[handleCreateTask] ${failedCount}/${fileAttachments.length} attachment links failed`);
          }
        }
      }

      toast({
        title: "Success",
        description: `Task created and assigned to ${formData.assignee}!`,
      });

      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      setTasks(tasksData || []);

      const newAttachments = await getTaskAttachments(createdTask.id);
      if (fileAttachments.length > 0 && newAttachments.length === 0) {
        console.error(`[handleCreateTask] Attachments were linked but retrieval returned 0`);
      }

      setTaskAttachments((prev) => {
        const updated = new Map(prev);
        updated.set(createdTask.id, newAttachments as FileAttachment[]);
        return updated;
      });

      setFormData({
        title: "",
        description: "",
        priority: "",
        category: "",
        assignmentType: "",
        assignee: "",
        dueDate: "",
        estimatedTime: "",
        paymentTerms: "",
        budget: "",
        checklist: [],
        evidenceTypes: [],
      });
      setFileAttachments([]);
      setSelectedComplaint(null);
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate dashboard stats
  const stats = {
    open: tasks.filter((t) => t.status !== "completed").length,
    urgent: tasks.filter((t) => t.priority === "urgent").length,
    completedToday: tasks.filter(
      (t) =>
        t.status === "completed" &&
        new Date(t.created_at).toDateString() === new Date().toDateString()
    ).length,
    awaitingChat: messages.filter(
      (m) => {
        const task = tasks.find((t) => t.id === m.taskId);
        return task && task.status !== "completed";
      }
    ).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sheraton-cream to-background">
      <div className="container py-8">
        {/* Page Header */}
        <TasksPageHeader />

        {/* Dashboard Stats */}
        <DashboardStats stats={stats} />

        {/* Navigation Tabs */}
        <TabsNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          {/* New Task Tab */}
          <TabsContent value="new-task" className="space-y-6">
            <NewTaskTab
              isLoading={isLoading}
              complaints={complaints}
              selectedComplaint={selectedComplaint}
              complaintAttachments={complaintAttachments}
              formData={formData}
              fileAttachments={fileAttachments}
              isSubmitting={isSubmitting}
              internalStaff={internalStaff}
              externalVendors={externalVendors}
              onSelectComplaint={handleSelectComplaint}
              onAcceptComplaint={handleAcceptComplaint}
              onFormChange={handleFormChange}
              onAddAttachments={(newAttachments) =>
                setFileAttachments((prev) => [...prev, ...newAttachments])
              }
              onRemoveAttachment={(id) =>
                setFileAttachments((prev) =>
                  prev.filter((att) => att.id !== id)
                )
              }
              onCreateTask={handleCreateTask}
              onClearSelectedComplaint={() => setSelectedComplaint(null)}
            />
          </TabsContent>

          {/* Todo List Tab */}
          <TabsContent value="todo-list" className="space-y-6">
            <TodoListTab
              userRole={userRole}
              currentUserProfile={currentUserProfile}
              tasks={tasks}
              taskResponses={taskResponses}
              taskProposals={taskProposals}
              todoItems={todoItems}
              taskAttachments={taskAttachments}
              todoAttachments={todoAttachments}
              searchQuery={searchQuery}
              filterStatus={filterStatus}
              onSearchChange={setSearchQuery}
              onFilterChange={setFilterStatus}
              onTaskSelect={setSelectedTask}
              onTabChange={handleTabChange}
              onProposalUpdated={() => {
                supabase
                  .from("task_proposals")
                  .select("*")
                  .order("created_at", { ascending: false })
                  .then(({ data }) => setTaskProposals(data || []));
              }}
              onTodoUpdated={() => {
                if (currentUserProfile) {
                  supabase
                    .from("todo_list")
                    .select("*")
                    .eq("provider_id", currentUserProfile.id)
                    .order("created_at", { ascending: false })
                    .then(({ data }) => setTodoItems(data || []));
                }
              }}
              onTaskResponseOpen={(task) => {
                setSelectedTaskForResponse(task);
                setShowResponseModal(true);
              }}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          {/* Live Chat Tab */}
          <TabsContent value="live-chat" className="space-y-6">
            <LiveChatTab
              selectedTask={selectedTask}
              tasks={tasks}
              currentUser={currentUser}
              currentUserProfile={currentUserProfile}
              userRole={userRole}
              onTaskSelect={setSelectedTask}
              onTabChange={handleTabChange}
            />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <ReportsTab
              tasks={tasks}
              currentUser={currentUser}
              currentUserProfile={currentUserProfile}
              userRole={userRole}
            />
          </TabsContent>
        </Tabs>

        {/* Task Response Modal */}
        {selectedTaskForResponse && currentUserProfile && (
          <TaskResponseModal
            isOpen={showResponseModal}
            task={selectedTaskForResponse}
            providerId={currentUserProfile.id}
            providerName={`${currentUserProfile.first_name} ${currentUserProfile.last_name}`}
            onClose={() => {
              setShowResponseModal(false);
              setSelectedTaskForResponse(null);
            }}
            onResponseSubmitted={() => {
              supabase
                .from("task_responses")
                .select("*")
                .order("created_at", { ascending: false })
                .then(({ data }) => setTaskResponses(data || []));

              if (currentUserProfile) {
                supabase
                  .from("todo_list")
                  .select("*")
                  .eq("provider_id", currentUserProfile.id)
                  .order("created_at", { ascending: false })
                  .then(({ data }) => setTodoItems(data || []));
              }

              setShowResponseModal(false);
              setSelectedTaskForResponse(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TasksPage;
