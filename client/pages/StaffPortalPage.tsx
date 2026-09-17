import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Textarea } from "../components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import {
  Crown,
  Briefcase,
  GraduationCap,
  CheckSquare,
  Users,
  MessageSquare,
  Phone,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  Trophy,
  Star,
  Send,
  Upload,
  Download,
  Play,
  Book,
  Target,
  TrendingUp,
  Bell,
  Settings,
  ChefHat,
  Home,
  Coffee,
  Car,
  Shield,
  Building,
  UserCheck,
  ClipboardList,
  Award,
  MessageCircle,
  Video,
  BookOpen,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  PlusCircle,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { Lightbulb } from "lucide-react";

interface NewTask {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string;
  dueTime: string;
  estimatedTime: string;
  category: "operations" | "service" | "training" | "maintenance";
  assignTo: string;
  checklist: string[];
}

const StaffPortalPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [reportContent, setReportContent] = useState("");
  const [newTask, setNewTask] = useState<NewTask>({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    dueTime: "09:00",
    estimatedTime: "30 min",
    category: "operations",
    assignTo: "",
    checklist: ["", "", ""],
  });

  // Mock staff members for task assignment
  const staffMembers = [
    { id: "ST001", name: "Marcus Rodriguez", position: "Front Desk Supervisor" },
    { id: "ST002", name: "Jennifer Kim", position: "Housekeeping Manager" },
    { id: "ST003", name: "David Park", position: "Guest Services" },
    { id: "ST004", name: "Sarah Chen", position: "Shift Supervisor" },
    { id: "ST005", name: "Emily Watson", position: "Front Desk Associate" },
    { id: "ST006", name: "James Martinez", position: "Maintenance Tech" },
  ];

  // Mock staff data
  const staffData = {
    id: "ST001",
    name: "Marcus Rodriguez",
    position: "Front Desk Supervisor",
    department: "Guest Services",
    shift: "Day Shift (7 AM - 3 PM)",
    joinDate: "2023-03-15",
    performanceScore: 92,
    completedTraining: 15,
    totalTraining: 20,
    tasksCompleted: 127,
    tasksTotal: 135,
    avatar: "",
    supervisor: "Sarah Chen",
    emergencyContact: "+1 (555) 999-0001",
  };

  const upcomingTasks = [
    {
      id: "T001",
      title: "Morning Check-in Preparation",
      description: "Prepare lobby, review guest arrivals, check room status",
      priority: "high",
      due: "2024-01-16T07:00:00",
      estimated: "30 min",
      checklist: [
        "Review guest arrival list",
        "Check room readiness status",
        "Prepare welcome packets",
        "Test key card system",
        "Brief night shift updates",
      ],
      completed: false,
      category: "operations",
    },
    {
      id: "T002",
      title: "Guest Feedback Review",
      description: "Review overnight guest feedback and prepare response plan",
      priority: "medium",
      due: "2024-01-16T09:00:00",
      estimated: "20 min",
      checklist: [
        "Review all feedback forms",
        "Categorize issues",
        "Draft response emails",
        "Update guest profiles",
        "Report to management",
      ],
      completed: false,
      category: "service",
    },
    {
      id: "T003",
      title: "Safety Protocol Training",
      description:
        "Complete monthly fire safety and emergency procedures training",
      priority: "high",
      due: "2024-01-16T14:00:00",
      estimated: "45 min",
      checklist: [
        "Review fire evacuation routes",
        "Test emergency equipment",
        "Update emergency contact list",
        "Practice emergency scenarios",
        "Submit completion certificate",
      ],
      completed: false,
      category: "training",
    },
  ];

  const completedTasks = [
    {
      id: "T004",
      title: "VIP Guest Welcome Setup",
      description: "Prepare special amenities for VIP arrival",
      completedAt: "2024-01-15T16:30:00",
      rating: 5,
      feedback: "Excellent attention to detail, guest was very pleased",
    },
    {
      id: "T005",
      title: "Inventory Count - Lobby Supplies",
      description: "Monthly inventory of guest services supplies",
      completedAt: "2024-01-15T11:00:00",
      rating: 4,
      feedback: "Good work, minor discrepancies noted and corrected",
    },
  ];

  const trainingModules = [
    {
      id: "TR001",
      title: "Customer Service Excellence",
      description: "Advanced techniques for exceptional guest service",
      duration: "2 hours",
      progress: 100,
      completed: true,
      certificate: true,
      instructor: "Sarah Chen",
      rating: 4.8,
      type: "video",
    },
    {
      id: "TR002",
      title: "Hotel Management Systems",
      description: "Complete guide to PMS and booking systems",
      duration: "1.5 hours",
      progress: 75,
      completed: false,
      certificate: false,
      instructor: "Tech Team",
      rating: 4.9,
      type: "interactive",
    },
    {
      id: "TR003",
      title: "Emergency Procedures & Safety",
      description: "Comprehensive safety protocols and procedures",
      duration: "1 hour",
      progress: 0,
      completed: false,
      certificate: false,
      instructor: "Security Team",
      rating: 4.7,
      type: "workshop",
    },
    {
      id: "TR004",
      title: "Conflict Resolution",
      description: "Handling difficult situations with guests",
      duration: "45 min",
      progress: 60,
      completed: false,
      certificate: false,
      instructor: "HR Department",
      rating: 4.6,
      type: "video",
    },
  ];

  const announcements = [
    {
      id: "A001",
      title: "New VIP Guest Protocol",
      content:
        "Updated procedures for handling VIP guests - effective immediately",
      priority: "urgent",
      date: "2024-01-15T08:00:00",
      department: "All",
      read: false,
    },
    {
      id: "A002",
      title: "Staff Appreciation Event",
      content: "Join us for the monthly staff appreciation dinner this Friday",
      priority: "info",
      date: "2024-01-14T15:30:00",
      department: "All",
      read: true,
    },
    {
      id: "A003",
      title: "System Maintenance Notice",
      content:
        "Booking system will be down for maintenance tonight 11 PM - 2 AM",
      priority: "warning",
      date: "2024-01-14T10:00:00",
      department: "Front Desk",
      read: false,
    },
  ];

  const emergencyContacts = [
    { name: "Emergency Services", number: "911", type: "emergency" },
    { name: "Hotel Security", number: "+1 (555) 999-0001", type: "security" },
    {
      name: "General Manager",
      number: "+1 (555) 999-0002",
      type: "management",
    },
    {
      name: "Maintenance Emergency",
      number: "+1 (555) 999-0003",
      type: "maintenance",
    },
    { name: "Medical Emergency", number: "+1 (555) 999-0004", type: "medical" },
    { name: "Fire Department", number: "+1 (555) 999-0005", type: "emergency" },
  ];

  const forumPosts = [
    {
      id: "F001",
      title: "Best practices for handling group check-ins?",
      author: "Jennifer Kim",
      department: "Front Desk",
      replies: 8,
      lastReply: "2024-01-15T14:30:00",
      category: "operations",
    },
    {
      id: "F002",
      title: "New guest feedback system tips",
      author: "David Park",
      department: "Guest Services",
      replies: 12,
      lastReply: "2024-01-15T11:15:00",
      category: "systems",
    },
    {
      id: "F003",
      title: "Shift handover checklist update",
      author: "Sarah Chen",
      department: "Management",
      replies: 5,
      lastReply: "2024-01-14T16:45:00",
      category: "procedures",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleTaskComplete = (taskId: string) => {
    // Here you would typically update the task status in the database
  };

  const handleSubmitReport = () => {
    // Here you would typically submit the report to the supervisor
    setReportContent("");
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim() || !newTask.assignTo) {
      alert("Please fill in the task title and assign it to a staff member");
      return;
    }

    // Filter out empty checklist items
    const filteredChecklist = newTask.checklist.filter((item) => item.trim());

    const taskData = {
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      dueDate: `${newTask.dueDate}T${newTask.dueTime}:00`,
      estimatedTime: newTask.estimatedTime,
      category: newTask.category,
      assignedTo: newTask.assignTo,
      checklist: filteredChecklist.length > 0 ? filteredChecklist : ["Task pending"],
    };

    // Reset form
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      dueTime: "09:00",
      estimatedTime: "30 min",
      category: "operations",
      assignTo: "",
      checklist: ["", "", ""],
    });
    setNewTaskChecklist(["", "", ""]);
    setShowCreateTask(false);

    // Show success message
    alert("Task created and allocated successfully!");
  };

  const handleChecklistChange = (index: number, value: string) => {
    const updated = [...newTask.checklist];
    updated[index] = value;
    setNewTask((prev) => ({
      ...prev,
      checklist: updated,
    }));
  };

  const addChecklistItem = () => {
    setNewTask((prev) => ({
      ...prev,
      checklist: [...prev.checklist, ""],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sheraton-cream to-background">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-sheraton-gold mr-2" />
            <Badge className="bg-sheraton-gold text-sheraton-navy px-4 py-2">
              Staff Portal
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-sheraton-navy mb-4">
            Welcome, {staffData.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            {staffData.position} • {staffData.department} • {staffData.shift}
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto p-1">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 py-3"
            >
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2 py-3">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger
              value="create-task"
              className="flex items-center gap-2 py-3"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Create Task</span>
            </TabsTrigger>
            <TabsTrigger
              value="training"
              className="flex items-center gap-2 py-3"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Training</span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center gap-2 py-3"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger
              value="communication"
              className="flex items-center gap-2 py-3"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Communication</span>
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="flex items-center gap-2 py-3"
            >
              <Book className="h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Staff Profile Card */}
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={staffData.avatar} />
                    <AvatarFallback className="text-xl font-bold bg-sheraton-gold text-sheraton-navy">
                      {staffData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-sheraton-navy">
                    {staffData.name}
                  </CardTitle>
                  <Badge className="sheraton-gradient text-white">
                    {staffData.position}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-sheraton-gold">
                        {staffData.performanceScore}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Performance Score
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-sheraton-gold">
                        {staffData.tasksCompleted}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tasks Completed
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Training Progress</span>
                      <span>
                        {Math.round(
                          (staffData.completedTraining /
                            staffData.totalTraining) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (staffData.completedTraining /
                          staffData.totalTraining) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Employee ID</span>
                      <span>{staffData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Department</span>
                      <span>{staffData.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Join Date</span>
                      <span>
                        {format(new Date(staffData.joinDate), "MMM yyyy")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Tasks */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-sheraton-gold" />
                    Today's Priority Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-sheraton-navy">
                            {task.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        </div>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due: {format(new Date(task.due), "h:mm a")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            {task.estimated}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setSelectedTask(task.id)}
                          className="sheraton-gradient text-white"
                        >
                          Start Task
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Link to="#" onClick={() => setActiveTab("tasks")}>
                    <Button variant="outline" className="w-full">
                      View All Tasks
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-sheraton-gold" />
                  <div className="text-2xl font-bold text-sheraton-navy">
                    {staffData.performanceScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Performance Score
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Target className="h-8 w-8 mx-auto mb-2 text-sheraton-gold" />
                  <div className="text-2xl font-bold text-sheraton-navy">
                    {staffData.tasksCompleted}/{staffData.tasksTotal}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tasks This Month
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 text-sheraton-gold" />
                  <div className="text-2xl font-bold text-sheraton-navy">
                    {staffData.completedTraining}/{staffData.totalTraining}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Training Modules
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Star className="h-8 w-8 mx-auto mb-2 text-sheraton-gold" />
                  <div className="text-2xl font-bold text-sheraton-navy">
                    4.8/5
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Guest Rating
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-sheraton-gold" />
                  Important Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.slice(0, 3).map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <div
                      className={`p-2 rounded-full ${getPriorityColor(announcement.priority)}`}
                    >
                      {announcement.priority === "urgent" && (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      {announcement.priority === "warning" && (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      {announcement.priority === "info" && (
                        <Bell className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{announcement.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {announcement.content}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(announcement.date), "MMM dd, h:mm a")}{" "}
                        • {announcement.department}
                      </div>
                    </div>
                    {!announcement.read && (
                      <Badge className="bg-sheraton-gold text-sheraton-navy">
                        New
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-sheraton-gold" />
                    Pending Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="border-l-4 border-l-sheraton-gold"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          </div>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          {task.checklist.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox id={`${task.id}-${index}`} />
                              <Label
                                htmlFor={`${task.id}-${index}`}
                                className="text-sm"
                              >
                                {item}
                              </Label>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Due: {format(new Date(task.due), "MMM dd, h:mm a")}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleTaskComplete(task.id)}
                            className="sheraton-gradient text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              {/* Completed Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Recently Completed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {completedTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="border-l-4 border-l-green-500"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: task.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground mb-2">
                          Completed:{" "}
                          {format(new Date(task.completedAt), "MMM dd, h:mm a")}
                        </div>

                        <div className="p-2 bg-green-50 rounded text-sm">
                          <strong>Feedback:</strong> {task.feedback}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Create Task Tab */}
          <TabsContent value="create-task" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-sheraton-gold" />
                  Create & Allocate New Task
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Create a task and assign it to a staff member to get started
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Form Section */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Task Title */}
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title *</Label>
                    <Input
                      id="task-title"
                      placeholder="e.g., Morning Check-in Preparation"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Task Description */}
                  <div className="space-y-2">
                    <Label htmlFor="task-desc">Description</Label>
                    <Textarea
                      id="task-desc"
                      placeholder="Detailed task description..."
                      rows={3}
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Priority and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority *</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) =>
                          setNewTask((prev) => ({
                            ...prev,
                            priority: value as NewTask["priority"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={newTask.category}
                        onValueChange={(value) =>
                          setNewTask((prev) => ({
                            ...prev,
                            category: value as NewTask["category"],
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Due Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="due-date">Due Date *</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) =>
                          setNewTask((prev) => ({
                            ...prev,
                            dueDate: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="due-time">Due Time</Label>
                      <Input
                        id="due-time"
                        type="time"
                        value={newTask.dueTime}
                        onChange={(e) =>
                          setNewTask((prev) => ({
                            ...prev,
                            dueTime: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimated">Estimated Time</Label>
                      <Select
                        value={newTask.estimatedTime}
                        onValueChange={(value) =>
                          setNewTask((prev) => ({
                            ...prev,
                            estimatedTime: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15 min">15 min</SelectItem>
                          <SelectItem value="30 min">30 min</SelectItem>
                          <SelectItem value="45 min">45 min</SelectItem>
                          <SelectItem value="1 hour">1 hour</SelectItem>
                          <SelectItem value="2 hours">2 hours</SelectItem>
                          <SelectItem value="3+ hours">3+ hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Assign To */}
                  <div className="space-y-2">
                    <Label htmlFor="assign-to">Assign To *</Label>
                    <Select value={newTask.assignTo} onValueChange={(value) =>
                      setNewTask((prev) => ({
                        ...prev,
                        assignTo: value,
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} - {member.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                    {/* Checklist */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Task Checklist (Optional)</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={addChecklistItem}
                        >
                          <PlusCircle className="h-3 w-3 mr-1" />
                          Add Item
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {newTask.checklist.map((item, index) => (
                          <Input
                            key={index}
                            placeholder={`Checklist item ${index + 1}`}
                            value={item}
                            onChange={(e) =>
                              handleChecklistChange(index, e.target.value)
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      className="w-full sheraton-gradient text-white"
                      onClick={handleCreateTask}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Create & Allocate Task
                    </Button>
                  </div>

                  {/* Sidebar - Tips & Guidelines */}
                  <div className="space-y-4">
                    <Card className="bg-sheraton-gold/5 border-sheraton-gold/20">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-sheraton-gold" />
                          Task Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div>
                          <h5 className="font-semibold text-sheraton-navy mb-1">
                            Clear Titles
                          </h5>
                          <p className="text-muted-foreground">
                            Use action verbs: "Prepare", "Review", "Update"
                          </p>
                        </div>
                        <Separator />
                        <div>
                          <h5 className="font-semibold text-sheraton-navy mb-1">
                            Priority Levels
                          </h5>
                          <p className="text-muted-foreground">
                            Use "Urgent" sparingly to maintain focus
                          </p>
                        </div>
                        <Separator />
                        <div>
                          <h5 className="font-semibold text-sheraton-navy mb-1">
                            Checklists
                          </h5>
                          <p className="text-muted-foreground">
                            Break down complex tasks into smaller steps
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-sheraton-gold" />
                          Recently Active
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {staffMembers.slice(0, 4).map((member) => (
                          <div key={member.id} className="text-sm">
                            <div className="font-medium text-sheraton-navy">
                              {member.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {member.position}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-sheraton-gold" />
                  Professional Development & Training
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trainingModules.map((module) => (
                    <Card
                      key={module.id}
                      className={`border-l-4 ${module.completed ? "border-l-green-500" : "border-l-sheraton-gold"}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {module.type === "video" && (
                              <Play className="h-4 w-4 text-blue-500" />
                            )}
                            {module.type === "interactive" && (
                              <Zap className="h-4 w-4 text-purple-500" />
                            )}
                            {module.type === "workshop" && (
                              <Users className="h-4 w-4 text-orange-500" />
                            )}
                            <h4 className="font-semibold">{module.title}</h4>
                          </div>
                          {module.completed && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {module.description}
                        </p>

                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                          <span>{module.duration}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{module.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            By {module.instructor}
                          </span>
                          <div className="flex gap-2">
                            {module.certificate && (
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3 mr-1" />
                                Cert
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className={
                                module.completed
                                  ? "bg-green-500 text-white"
                                  : "sheraton-gradient text-white"
                              }
                            >
                              {module.completed ? "Review" : "Continue"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-sheraton-gold" />
                  Submit Daily Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report">Shift Report</Label>
                  <Textarea
                    id="report"
                    placeholder="Describe your shift activities, guest interactions, issues resolved, and any observations..."
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Shift Rating</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Rate your shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Excellent (5/5)</SelectItem>
                        <SelectItem value="4">Good (4/5)</SelectItem>
                        <SelectItem value="3">Average (3/5)</SelectItem>
                        <SelectItem value="2">Below Average (2/5)</SelectItem>
                        <SelectItem value="1">Poor (1/5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Guests Served</Label>
                    <Input type="number" placeholder="Number of guests" />
                  </div>

                  <div className="space-y-2">
                    <Label>Issues Resolved</Label>
                    <Input type="number" placeholder="Number of issues" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="photo" />
                  <Label htmlFor="photo">Include shift photos</Label>
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </Button>
                </div>

                <Button
                  onClick={handleSubmitReport}
                  className="w-full sheraton-gradient text-white"
                  disabled={!reportContent.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report to {staffData.supervisor}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Staff Forum */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-sheraton-gold" />
                    Staff Forum
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {forumPosts.map((post) => (
                    <div key={post.id} className="p-3 border rounded-lg">
                      <h4 className="font-semibold text-sm">{post.title}</h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>
                          {post.author} • {post.department}
                        </span>
                        <span>{post.replies} replies</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last reply:{" "}
                        {format(new Date(post.lastReply), "MMM dd, h:mm a")}
                      </div>
                    </div>
                  ))}

                  <Button className="w-full" variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Start New Discussion
                  </Button>
                </CardContent>
              </Card>

              {/* Emergency Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-sheraton-gold" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            contact.type === "emergency"
                              ? "bg-red-100 text-red-600"
                              : contact.type === "security"
                                ? "bg-blue-100 text-blue-600"
                                : contact.type === "management"
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {contact.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {contact.number}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Call
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-sheraton-gold" />
                    Procedures Manual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Home className="h-4 w-4 mr-2" />
                    Housekeeping Procedures
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ChefHat className="h-4 w-4 mr-2" />
                    Food Service Standards
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Guest Service Guidelines
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Safety Protocols
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-sheraton-gold" />
                    System Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Building className="h-4 w-4 mr-2" />
                    Property Management
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Scheduling System
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Incident Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Car className="h-4 w-4 mr-2" />
                    Maintenance Requests
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-sheraton-gold" />
                    Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center p-4 bg-sheraton-gold/10 rounded-lg">
                    <Award className="h-8 w-8 mx-auto mb-2 text-sheraton-gold" />
                    <div className="font-semibold">Employee of the Month</div>
                    <div className="text-sm text-muted-foreground">
                      December 2023
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Star className="h-4 w-4 mr-2" />
                    View All Achievements
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StaffPortalPage;
