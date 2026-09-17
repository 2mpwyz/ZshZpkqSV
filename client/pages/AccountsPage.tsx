import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  FileText,
  CheckCircle,
} from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive" | "suspended";
  rating: number;
  totalEarnings: number;
  tasksCompleted: number;
}

interface Quote {
  id: string;
  vendorId: string;
  vendorName: string;
  taskId: string;
  amount: number;
  description: string;
  status: "pending" | "accepted" | "rejected";
  submittedDate: string;
  validUntil: string;
}

interface Invoice {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
  issuedDate: string;
  dueDate: string;
  tasks: string[];
}

const AccountsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("vendors");
  const [showAddVendor, setShowAddVendor] = useState(false);

  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: "V001",
      name: "ABC Plumbing",
      category: "Plumbing",
      email: "contact@abcplumbing.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, City, State 12345",
      status: "active",
      rating: 4.6,
      totalEarnings: 12400,
      tasksCompleted: 8,
    },
    {
      id: "V002",
      name: "XYZ Electric",
      category: "Electrical",
      email: "info@xyzelectric.com",
      phone: "+1 (555) 234-5678",
      address: "456 Oak Ave, City, State 54321",
      status: "active",
      rating: 4.7,
      totalEarnings: 18600,
      tasksCompleted: 12,
    },
    {
      id: "V003",
      name: "GreenScape Landscaping",
      category: "Landscaping",
      email: "hello@greenscape.com",
      phone: "+1 (555) 345-6789",
      address: "789 Garden Ln, City, State 99999",
      status: "active",
      rating: 4.3,
      totalEarnings: 5800,
      tasksCompleted: 5,
    },
  ]);

  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: "Q001",
      vendorId: "V001",
      vendorName: "ABC Plumbing",
      taskId: "TASK-005",
      amount: 450,
      description: "Fix leaking pipe in kitchen",
      status: "pending",
      submittedDate: "2024-01-15",
      validUntil: "2024-01-22",
    },
    {
      id: "Q002",
      vendorId: "V002",
      vendorName: "XYZ Electric",
      taskId: "TASK-006",
      amount: 600,
      description: "Replace circuit breaker",
      status: "accepted",
      submittedDate: "2024-01-14",
      validUntil: "2024-01-21",
    },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "INV-001",
      vendorId: "V001",
      vendorName: "ABC Plumbing",
      amount: 1200,
      status: "paid",
      issuedDate: "2024-01-10",
      dueDate: "2024-01-25",
      tasks: ["TASK-001", "TASK-003"],
    },
    {
      id: "INV-002",
      vendorId: "V002",
      vendorName: "XYZ Electric",
      amount: 1800,
      status: "pending",
      issuedDate: "2024-01-12",
      dueDate: "2024-01-27",
      tasks: ["TASK-002", "TASK-004"],
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sheraton-cream to-background">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-sheraton-gold mr-2" />
            <Badge className="bg-sheraton-gold text-sheraton-navy px-4 py-2">
              Account Management
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-sheraton-navy mb-4">
            Vendor & Contractor Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage vendors, quotes, and billing
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Vendors
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Quotes
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Active Vendors</h2>
              <Button
                className="sheraton-gradient text-white"
                onClick={() => setShowAddVendor(!showAddVendor)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </div>

            {showAddVendor && (
              <Card className="bg-sheraton-gold/5 border-sheraton-gold/20">
                <CardHeader>
                  <CardTitle>Add New Vendor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vendor Name *</Label>
                      <Input placeholder="Company name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plumbing">Plumbing</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="hvac">HVAC</SelectItem>
                          <SelectItem value="landscaping">
                            Landscaping
                          </SelectItem>
                          <SelectItem value="painting">Painting</SelectItem>
                          <SelectItem value="carpentry">Carpentry</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input type="email" placeholder="vendor@company.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input type="tel" placeholder="+1 (555) 123-4567" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Address</Label>
                      <Input placeholder="Full address" />
                    </div>

                    <div className="flex gap-2 md:col-span-2">
                      <Button
                        className="flex-1 sheraton-gradient text-white"
                        onClick={() => setShowAddVendor(false)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vendor
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowAddVendor(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <Card key={vendor.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{vendor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {vendor.category}
                        </p>
                      </div>
                      <Badge className={getStatusColor(vendor.status)}>
                        {vendor.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{vendor.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{vendor.phone}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tasks</p>
                        <p className="font-bold text-lg">
                          {vendor.tasksCompleted}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Earnings</p>
                        <p className="font-bold text-lg">
                          ${vendor.totalEarnings.toLocaleString()}
                        </p>
                      </div>
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

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <h2 className="text-2xl font-bold">Quotes</h2>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Quote ID</th>
                        <th className="text-left p-4 font-semibold">Vendor</th>
                        <th className="text-left p-4 font-semibold">Task ID</th>
                        <th className="text-left p-4 font-semibold">Amount</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Valid Until</th>
                        <th className="text-left p-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map((quote) => (
                        <tr key={quote.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-medium">{quote.id}</td>
                          <td className="p-4">{quote.vendorName}</td>
                          <td className="p-4">{quote.taskId}</td>
                          <td className="p-4 font-semibold">
                            ${quote.amount.toLocaleString()}
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(quote.status)}>
                              {quote.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {quote.validUntil}
                          </td>
                          <td className="p-4">
                            {quote.status === "pending" && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline">
                                  Accept
                                </Button>
                                <Button size="sm" variant="outline">
                                  Reject
                                </Button>
                              </div>
                            )}
                            {quote.status !== "pending" && (
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <h2 className="text-2xl font-bold">Invoices & Payments</h2>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">
                          Invoice ID
                        </th>
                        <th className="text-left p-4 font-semibold">Vendor</th>
                        <th className="text-left p-4 font-semibold">Amount</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">
                          Due Date
                        </th>
                        <th className="text-left p-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-4 font-medium">{invoice.id}</td>
                          <td className="p-4">{invoice.vendorName}</td>
                          <td className="p-4 font-semibold">
                            ${invoice.amount.toLocaleString()}
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {invoice.dueDate}
                          </td>
                          <td className="p-4">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountsPage;
