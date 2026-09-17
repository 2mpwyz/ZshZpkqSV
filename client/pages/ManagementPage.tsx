import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
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
import { Progress } from "../components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Crown,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Hotel,
  Utensils,
  Calendar,
  Star,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Settings,
  ShieldCheck,
  Award,
  Zap,
  Building,
  Coffee,
  Car,
  Wifi,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  PieChart as PieChartIcon,
  Activity,
  Briefcase,
  ShoppingCart,
  CreditCard,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { format, subDays, subMonths } from "date-fns";

const ManagementPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30days");

  // Mock analytics data
  const revenueData = [
    { date: "Jan 1", revenue: 45000, bookings: 120, avgRate: 375 },
    { date: "Jan 2", revenue: 52000, bookings: 135, avgRate: 385 },
    { date: "Jan 3", revenue: 48000, bookings: 128, avgRate: 375 },
    { date: "Jan 4", revenue: 61000, bookings: 155, avgRate: 395 },
    { date: "Jan 5", revenue: 59000, bookings: 148, avgRate: 399 },
    { date: "Jan 6", revenue: 66000, bookings: 165, avgRate: 400 },
    { date: "Jan 7", revenue: 71000, bookings: 175, avgRate: 406 },
  ];

  const occupancyData = [
    { month: "Aug", occupancy: 85, adr: 380, revpar: 323 },
    { month: "Sep", occupancy: 92, adr: 395, revpar: 363 },
    { month: "Oct", occupancy: 88, adr: 405, revpar: 356 },
    { month: "Nov", occupancy: 78, adr: 365, revpar: 285 },
    { month: "Dec", occupancy: 95, adr: 420, revpar: 399 },
    { month: "Jan", occupancy: 82, adr: 385, revpar: 316 },
  ];

  const departmentRevenue = [
    { name: "Rooms", value: 2400000, color: "#D4AF37" },
    { name: "F&B", value: 980000, color: "#B8860B" },
    { name: "Spa & Wellness", value: 340000, color: "#DAA520" },
    { name: "Events", value: 580000, color: "#FFD700" },
    { name: "Other Services", value: 160000, color: "#F0E68C" },
  ];

  const guestSatisfactionData = [
    { category: "Room Quality", score: 4.8, target: 4.5 },
    { category: "Service", score: 4.9, target: 4.6 },
    { category: "Dining", score: 4.7, target: 4.4 },
    { category: "Cleanliness", score: 4.9, target: 4.7 },
    { category: "Value", score: 4.6, target: 4.3 },
    { category: "Overall", score: 4.8, target: 4.5 },
  ];

  const kpiData = {
    totalRevenue: 4620000,
    revenueGrowth: 12.5,
    occupancyRate: 82,
    occupancyChange: -3.2,
    adr: 385,
    adrChange: 8.1,
    revpar: 316,
    revparChange: 4.3,
    guestSatisfaction: 4.8,
    satisfactionChange: 0.2,
    staffEfficiency: 94,
    staffChange: 2.1,
  };

  const operationalMetrics = {
    totalRooms: 250,
    occupiedRooms: 205,
    availableRooms: 45,
    outOfOrderRooms: 3,
    checkInsToday: 87,
    checkOutsToday: 92,
    walkIns: 12,
    cancellations: 8,
    totalStaff: 180,
    staffOnDuty: 156,
    maintenanceRequests: 14,
    completedRequests: 38,
  };

  const recentBookings = [
    {
      id: "BK001",
      guest: "Alexandra Chen",
      room: "Presidential Suite",
      checkIn: "2024-01-16",
      nights: 3,
      revenue: 1800,
      source: "Direct",
      status: "confirmed",
    },
    {
      id: "BK002",
      guest: "Marcus Johnson",
      room: "Deluxe King",
      checkIn: "2024-01-16",
      nights: 2,
      revenue: 760,
      source: "App",
      status: "confirmed",
    },
    {
      id: "BK003",
      guest: "Sarah Williams",
      room: "Garden Villa",
      checkIn: "2024-01-17",
      nights: 4,
      revenue: 1600,
      source: "App",
      status: "pending",
    },
    {
      id: "BK004",
      guest: "David Park",
      room: "Deluxe Suite",
      checkIn: "2024-01-17",
      nights: 1,
      revenue: 450,
      source: "Walk-in",
      status: "confirmed",
    },
  ];

  const staffPerformance = [
    {
      name: "Marcus Rodriguez",
      department: "Front Desk",
      score: 92,
      tasksCompleted: 127,
      guestRating: 4.8,
      trend: "up",
    },
    {
      name: "Elena Vasquez",
      department: "Housekeeping",
      score: 96,
      tasksCompleted: 145,
      guestRating: 4.9,
      trend: "up",
    },
    {
      name: "James Chen",
      department: "F&B",
      score: 88,
      tasksCompleted: 112,
      guestRating: 4.6,
      trend: "stable",
    },
    {
      name: "Lisa Park",
      department: "Concierge",
      score: 94,
      tasksCompleted: 134,
      guestRating: 4.8,
      trend: "up",
    },
  ];

  const alerts = [
    {
      id: "A001",
      type: "urgent",
      title: "Low Room Inventory",
      message: "Only 12 rooms available for next weekend",
      time: "5 min ago",
      action: "Review Pricing",
    },
    {
      id: "A002",
      type: "warning",
      title: "Maintenance Required",
      message: "HVAC system in Suite 401 needs attention",
      time: "15 min ago",
      action: "Schedule Repair",
    },
    {
      id: "A003",
      type: "info",
      title: "VIP Arrival Tomorrow",
      message: "Celebrity guest arriving - special preparations needed",
      time: "1 hour ago",
      action: "Prepare Suite",
    },
  ];

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "border-red-500 bg-red-50";
      case "warning":
        return "border-yellow-500 bg-yellow-50";
      case "info":
        return "border-blue-500 bg-blue-50";
      default:
        return "border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sheraton-cream to-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Crown className="h-8 w-8 text-sheraton-gold mr-2" />
              <Badge className="bg-sheraton-gold text-sheraton-navy px-4 py-2">
                Management Dashboard
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-sheraton-navy mb-2">
              Hotel Operations Center
            </h1>
            <p className="text-lg text-muted-foreground">
              Real-time insights • Performance analytics • Business intelligence
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="sheraton-gradient text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto p-1">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 py-3"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="revenue"
              className="flex items-center gap-2 py-3"
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Revenue</span>
            </TabsTrigger>
            <TabsTrigger
              value="operations"
              className="flex items-center gap-2 py-3"
            >
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Operations</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2 py-3">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger
              value="guests"
              className="flex items-center gap-2 py-3"
            >
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Guests</span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center gap-2 py-3"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold">
                        ${(kpiData.totalRevenue / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-sheraton-gold" />
                  </div>
                  <div
                    className={`flex items-center mt-2 ${getChangeColor(kpiData.revenueGrowth)}`}
                  >
                    {getChangeIcon(kpiData.revenueGrowth)}
                    <span className="text-sm ml-1">
                      {Math.abs(kpiData.revenueGrowth)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Occupancy</p>
                      <p className="text-2xl font-bold">
                        {kpiData.occupancyRate}%
                      </p>
                    </div>
                    <Hotel className="h-8 w-8 text-sheraton-gold" />
                  </div>
                  <div
                    className={`flex items-center mt-2 ${getChangeColor(kpiData.occupancyChange)}`}
                  >
                    {getChangeIcon(kpiData.occupancyChange)}
                    <span className="text-sm ml-1">
                      {Math.abs(kpiData.occupancyChange)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ADR</p>
                      <p className="text-2xl font-bold">${kpiData.adr}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-sheraton-gold" />
                  </div>
                  <div
                    className={`flex items-center mt-2 ${getChangeColor(kpiData.adrChange)}`}
                  >
                    {getChangeIcon(kpiData.adrChange)}
                    <span className="text-sm ml-1">
                      {Math.abs(kpiData.adrChange)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">RevPAR</p>
                      <p className="text-2xl font-bold">${kpiData.revpar}</p>
                    </div>
                    <Target className="h-8 w-8 text-sheraton-gold" />
                  </div>
                  <div
                    className={`flex items-center mt-2 ${getChangeColor(kpiData.revparChange)}`}
                  >
                    {getChangeIcon(kpiData.revparChange)}
                    <span className="text-sm ml-1">
                      {Math.abs(kpiData.revparChange)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Guest Score
                      </p>
                      <p className="text-2xl font-bold">
                        {kpiData.guestSatisfaction}/5
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-sheraton-gold" />
                  </div>
                  <div
                    className={`flex items-center mt-2 ${getChangeColor(kpiData.satisfactionChange)}`}
                  >
                    {getChangeIcon(kpiData.satisfactionChange)}
                    <span className="text-sm ml-1">
                      {Math.abs(kpiData.satisfactionChange)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Staff Efficiency
                      </p>
                      <p className="text-2xl font-bold">
                        {kpiData.staffEfficiency}%
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-sheraton-gold" />
                  </div>
                  <div
                    className={`flex items-center mt-2 ${getChangeColor(kpiData.staffChange)}`}
                  >
                    {getChangeIcon(kpiData.staffChange)}
                    <span className="text-sm ml-1">
                      {Math.abs(kpiData.staffChange)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-sheraton-gold" />
                    Revenue Trend (7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#D4AF37"
                        fill="#D4AF37"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue by Department */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-sheraton-gold" />
                    Revenue by Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentRevenue}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentRevenue.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Alerts & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Critical Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Critical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {alert.message}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {alert.time}
                          </span>
                        </div>
                        <Button size="sm" variant="outline">
                          {alert.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-sheraton-gold" />
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold">{booking.guest}</h4>
                          <p className="text-sm text-muted-foreground">
                            {booking.room} • {booking.nights} nights
                          </p>
                          <span className="text-xs text-muted-foreground">
                            Check-in: {booking.checkIn}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            ${booking.revenue}
                          </div>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Occupancy & ADR Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy & ADR Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={occupancyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="occupancy"
                        name="Occupancy %"
                        fill="#D4AF37"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="adr"
                        name="ADR $"
                        fill="#B8860B"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {departmentRevenue.map((dept) => (
                      <div key={dept.name}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{dept.name}</span>
                          <span className="font-semibold">
                            ${(dept.value / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <Progress
                          value={(dept.value / 2400000) * 100}
                          className="h-3"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Room Status</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-sheraton-gold mb-2">
                    {operationalMetrics.occupiedRooms}/
                    {operationalMetrics.totalRooms}
                  </div>
                  <p className="text-sm text-muted-foreground">Occupied</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Available:</span>
                      <span>{operationalMetrics.availableRooms}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Out of Order:</span>
                      <span className="text-red-500">
                        {operationalMetrics.outOfOrderRooms}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    Today's Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Check-ins:</span>
                    <span className="font-semibold text-green-600">
                      {operationalMetrics.checkInsToday}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Check-outs:</span>
                    <span className="font-semibold text-blue-600">
                      {operationalMetrics.checkOutsToday}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Walk-ins:</span>
                    <span className="font-semibold">
                      {operationalMetrics.walkIns}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cancellations:</span>
                    <span className="font-semibold text-red-600">
                      {operationalMetrics.cancellations}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Staff Status</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-sheraton-gold mb-2">
                    {operationalMetrics.staffOnDuty}/
                    {operationalMetrics.totalStaff}
                  </div>
                  <p className="text-sm text-muted-foreground">On Duty</p>
                  <Progress
                    value={
                      (operationalMetrics.staffOnDuty /
                        operationalMetrics.totalStaff) *
                      100
                    }
                    className="mt-4"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Maintenance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Open Requests:</span>
                    <span className="font-semibold text-orange-600">
                      {operationalMetrics.maintenanceRequests}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Completed Today:</span>
                    <span className="font-semibold text-green-600">
                      {operationalMetrics.completedRequests}
                    </span>
                  </div>
                  <Progress
                    value={
                      (operationalMetrics.completedRequests /
                        (operationalMetrics.completedRequests +
                          operationalMetrics.maintenanceRequests)) *
                      100
                    }
                    className="mt-4"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-sheraton-gold" />
                  Staff Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffPerformance.map((staff) => (
                    <div
                      key={staff.name}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-sheraton-gold/10 flex items-center justify-center">
                          <span className="font-semibold text-sheraton-gold">
                            {staff.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{staff.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {staff.department}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="font-semibold">{staff.score}%</div>
                          <div className="text-xs text-muted-foreground">
                            Performance
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">
                            {staff.tasksCompleted}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Tasks
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {staff.guestRating}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Guest Rating
                          </div>
                        </div>
                        <div className="text-center">
                          {staff.trend === "up" && (
                            <ArrowUp className="h-5 w-5 text-green-500 mx-auto" />
                          )}
                          {staff.trend === "stable" && (
                            <Minus className="h-5 w-5 text-gray-500 mx-auto" />
                          )}
                          <div className="text-xs text-muted-foreground">
                            Trend
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guests Tab */}
          <TabsContent value="guests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-sheraton-gold" />
                  Guest Satisfaction Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guestSatisfactionData.map((metric) => (
                    <div key={metric.category} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{metric.category}</span>
                        <span className="font-semibold">
                          {metric.score}/5.0
                          <span className="text-sm text-muted-foreground ml-2">
                            (Target: {metric.target})
                          </span>
                        </span>
                      </div>
                      <Progress
                        value={(metric.score / 5) * 100}
                        className="h-3"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Balance Sheet
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    P&L Statement
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Cash Flow
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Revenue by Source
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Operational Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Hotel className="h-4 w-4 mr-2" />
                    Occupancy Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Staff Performance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Guest Satisfaction
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Maintenance Log
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start sheraton-gradient text-white border-0"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    QuickBooks Export
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Excel Spreadsheet
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    PDF Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Custom Export
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

export default ManagementPage;
