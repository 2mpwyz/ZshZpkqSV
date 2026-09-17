import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tasks");

  const taskReports = [
    {
      id: "RPT-001",
      name: "Monthly Task Completion",
      description: "Overview of completed tasks this month",
      date: "2024-01-15",
      status: "completed",
      icon: CheckCircle,
    },
    {
      id: "RPT-002",
      name: "Overdue Tasks Analysis",
      description: "Tasks exceeding their due dates",
      date: "2024-01-15",
      status: "alert",
      icon: AlertCircle,
    },
    {
      id: "RPT-003",
      name: "Task Category Distribution",
      description: "Breakdown of tasks by category",
      date: "2024-01-14",
      status: "completed",
      icon: BarChart3,
    },
  ];

  const performanceMetrics = [
    {
      name: "John Smith",
      position: "Maintenance",
      tasksCompleted: 24,
      completionRate: 96,
      avgCompletionTime: "2.5 hours",
      rating: 4.8,
    },
    {
      name: "Sarah Johnson",
      position: "Housekeeping",
      tasksCompleted: 31,
      completionRate: 100,
      avgCompletionTime: "3.2 hours",
      rating: 4.9,
    },
    {
      name: "Mike Wilson",
      position: "Guest Services",
      tasksCompleted: 19,
      completionRate: 89,
      avgCompletionTime: "2.1 hours",
      rating: 4.5,
    },
  ];

  const vendorMetrics = [
    {
      name: "ABC Plumbing",
      tasksCompleted: 8,
      avgQuoteTime: "24 hours",
      acceptanceRate: 87,
      rating: 4.6,
      totalRevenue: "$4,200",
    },
    {
      name: "XYZ Electric",
      tasksCompleted: 12,
      avgQuoteTime: "18 hours",
      acceptanceRate: 92,
      rating: 4.7,
      totalRevenue: "$6,800",
    },
    {
      name: "GreenScape Landscaping",
      tasksCompleted: 5,
      avgQuoteTime: "36 hours",
      acceptanceRate: 75,
      rating: 4.3,
      totalRevenue: "$2,150",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sheraton-cream to-background">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-sheraton-gold mr-2" />
            <Badge className="bg-sheraton-gold text-sheraton-navy px-4 py-2">
              Reports & Analytics
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-sheraton-navy mb-4">
            Reports & Analytics
          </h1>
          <p className="text-lg text-muted-foreground">
            Track performance, completion rates, and vendor metrics
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Task Reports
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Staff Performance
            </TabsTrigger>
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Vendor Reports
            </TabsTrigger>
          </TabsList>

          {/* Task Reports Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {taskReports.map((report) => {
                const Icon = report.icon;
                return (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{report.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.description}
                          </p>
                        </div>
                        <Icon className="h-5 w-5 text-sheraton-gold" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Generated
                        </span>
                        <span className="text-sm font-medium">{report.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge
                          className={
                            report.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }
                        >
                          {report.status}
                        </Badge>
                      </div>
                      <Button className="w-full sheraton-gradient text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Staff Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Member Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.map((staff, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-sheraton-navy">
                            {staff.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {staff.position}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.floor(staff.rating) }).map(
                            (_, i) => (
                              <span key={i} className="text-yellow-400">
                                ★
                              </span>
                            )
                          )}
                          <span className="text-sm text-muted-foreground">
                            {staff.rating}/5
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tasks</span>
                          <p className="font-semibold text-lg">
                            {staff.tasksCompleted}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Completion
                          </span>
                          <p className="font-semibold text-lg">
                            {staff.completionRate}%
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Avg. Time
                          </span>
                          <p className="font-semibold">
                            {staff.avgCompletionTime}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Efficiency
                          </span>
                          <Badge className="bg-green-100 text-green-800">
                            High
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendor Reports Tab */}
          <TabsContent value="vendors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor/Contractor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendorMetrics.map((vendor, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-sheraton-navy">
                            {vendor.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Service Provider
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.floor(vendor.rating) }).map(
                            (_, i) => (
                              <span key={i} className="text-yellow-400">
                                ★
                              </span>
                            )
                          )}
                          <span className="text-sm text-muted-foreground">
                            {vendor.rating}/5
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Tasks</span>
                          <p className="font-semibold text-lg">
                            {vendor.tasksCompleted}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Quote Time
                          </span>
                          <p className="font-semibold">
                            {vendor.avgQuoteTime}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Acceptance
                          </span>
                          <p className="font-semibold">
                            {vendor.acceptanceRate}%
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Revenue
                          </span>
                          <p className="font-semibold">{vendor.totalRevenue}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status</span>
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportsPage;
