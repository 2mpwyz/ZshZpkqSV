import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import GuestComplaintForm from "../components/GuestComplaintForm";
import {
  Briefcase,
  CheckCircle,
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  BarChart3,
  Target,
  Zap,
  Shield,
  Award,
  Calendar,
  Loader,
} from "lucide-react";

interface ServicesHomePageProps {
  role?: "manager" | "service_provider";
  displayName?: string;
}

const ServicesHomePage = ({
  role = "service_provider",
  displayName = role === "manager" ? "Manager" : "Service Provider",
}: ServicesHomePageProps) => {
  const [timeOfDay, setTimeOfDay] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("morning");
    else if (hour < 17) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");
  }, []);

  const providerFeatures = [
    {
      title: "Task Management",
      description: "Create, assign, and track service delivery tasks in real-time",
      icon: CheckCircle,
      href: "/tasks/list",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      title: "Performance Analytics",
      description: "Monitor key metrics and optimize service delivery",
      icon: BarChart3,
      href: "/reports",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      title: "Resource Planning",
      description: "Allocate staff and manage operations efficiently",
      icon: Users,
      href: "/accounts",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Priority Management",
      description: "Handle urgent requests and escalations seamlessly",
      icon: AlertCircle,
      href: "/tasks/new",
      gradient: "from-orange-500 to-red-600",
    },
  ];

  const managementCapabilities = [
    {
      title: "Daily Operations",
      description: "Streamlined workflows for service delivery coordination",
      icon: Calendar,
      href: "/tasks/list",
      image: "📋",
    },
    {
      title: "Team Coordination",
      description: "Keep your team aligned and informed in real-time",
      icon: Users,
      href: "/accounts",
      image: "👥",
    },
    {
      title: "Quality Assurance",
      description: "Monitor and maintain service quality standards",
      icon: Shield,
      href: "/reports",
      image: "✓",
    },
    {
      title: "Growth Tracking",
      description: "Analyze trends and identify opportunities for improvement",
      icon: TrendingUp,
      href: "/reports",
      image: "📈",
    },
  ];

  const getGreeting = () => {
    const greetings = {
      morning: "Good Morning",
      afternoon: "Good Afternoon",
      evening: "Good Evening",
    };
    return greetings[timeOfDay as keyof typeof greetings] || "Welcome";
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden sheraton-hero-gradient">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex items-center justify-center mb-6">
              <Briefcase className="h-12 w-12 text-sheraton-gold mr-4" />
              <Badge className="bg-sheraton-gold text-sheraton-navy text-lg px-4 py-2">
                Service Management Platform
              </Badge>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {getGreeting()},
              <br />
              <span className="text-shimmer">{displayName}</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              Empower your operations with intelligent task management, real-time 
              analytics, and comprehensive service delivery tools designed for 
              property managers and service providers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/tasks/list">
                <Button
                  size="lg"
                  className="sheraton-gradient text-white px-8 py-6 text-lg font-semibold luxury-shadow hover:scale-105 transition-transform"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  View Your Tasks
                </Button>
              </Link>
              <Link to="/reports">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-effect border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Reports
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="glass-effect rounded-2xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Loader className="h-5 w-5 text-sheraton-gold animate-spin" />
                  <span className="font-semibold">Active Operations</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Live
                </Badge>
              </div>
              <p className="text-sm text-white/80">
                Monitor your tasks, performance, and team productivity in one place
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Provider Features Grid */}
      <section className="py-20 bg-gradient-to-b from-background to-sheraton-cream">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sheraton-navy mb-4">
              Management Tools & Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions to manage your operations, track performance, 
              and optimize service delivery across your property and team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {providerFeatures.map((feature, index) => (
              <Link key={index} to={feature.href}>
                <Card className="group hover:scale-105 transition-all duration-300 luxury-shadow hover:shadow-2xl border-0 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${feature.gradient}`} />
                  <CardHeader className="text-center">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-sheraton-navy">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Management Capabilities */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sheraton-navy mb-4">
              Operational Excellence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage every aspect of your service delivery with powerful tools 
              designed for efficiency and quality assurance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {managementCapabilities.map((capability, index) => (
              <Link key={index} to={capability.href}>
                <Card className="group hover:scale-105 transition-all duration-300 luxury-shadow hover:shadow-2xl border-0 overflow-hidden">
                  <CardHeader className="text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                      {capability.image}
                    </div>
                    <CardTitle className="text-sheraton-navy flex items-center justify-center gap-2">
                      <capability.icon className="h-5 w-5 text-sheraton-gold" />
                      {capability.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground">
                      {capability.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Insights */}
      <section className="py-20 bg-sheraton-cream">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-sheraton-navy mb-4">
                Data-Driven Insights
              </h2>
              <p className="text-lg text-muted-foreground">
                Real-time analytics and performance tracking to optimize your 
                operations and service quality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center p-6 border-sheraton-gold border-2">
                <TrendingUp className="h-12 w-12 text-sheraton-gold mx-auto mb-4" />
                <h3 className="font-semibold text-sheraton-navy mb-2">
                  Performance Metrics
                </h3>
                <p className="text-sm text-muted-foreground">
                  Track key performance indicators and operational efficiency
                </p>
              </Card>

              <Card className="text-center p-6 border-sheraton-gold border-2">
                <Target className="h-12 w-12 text-sheraton-gold mx-auto mb-4" />
                <h3 className="font-semibold text-sheraton-navy mb-2">
                  Goal Tracking
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set and monitor service delivery targets and objectives
                </p>
              </Card>

              <Card className="text-center p-6 border-sheraton-gold border-2">
                <Zap className="h-12 w-12 text-sheraton-gold mx-auto mb-4" />
                <h3 className="font-semibold text-sheraton-navy mb-2">
                  Quick Actions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Respond rapidly to issues and optimize workflows in real-time
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Standards */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-sheraton-navy mb-4">
                Built for Excellence
              </h2>
              <p className="text-lg text-muted-foreground">
                Enterprise-grade tools and reliability for professional service delivery
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full sheraton-gradient flex items-center justify-center">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-sheraton-navy">
                  Premium Quality
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade tools
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full sheraton-gradient flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-sheraton-navy">
                  Secure & Reliable
                </h3>
                <p className="text-sm text-muted-foreground">
                  Data protection & backup
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full sheraton-gradient flex items-center justify-center">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-sheraton-navy">
                  24/7 Support
                </h3>
                <p className="text-sm text-muted-foreground">
                  Always available assistance
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full sheraton-gradient flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-sheraton-navy">
                  Rapid Deployment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quick implementation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section - Replicated from original */}
      <section className="py-12 bg-orange-50 border-t border-orange-200">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-sheraton-navy mb-2">
                Experience an Issue?
              </h3>
              <p className="text-muted-foreground">
                We're here to help. Report any issue and our team will address it immediately.
              </p>
            </div>
            <GuestComplaintForm triggerButtonText="Report an Issue" />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 sheraton-gradient">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto text-white">
            <Briefcase className="h-16 w-16 mx-auto mb-6 text-white" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Optimize Your Operations?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Take control of your property management with intelligent task coordination, 
              real-time analytics, and comprehensive service delivery tools. Start managing 
              your operations more efficiently today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tasks/list">
                <Button
                  size="lg"
                  className="bg-white text-sheraton-navy hover:bg-white/90 px-8 py-6 text-lg font-semibold"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Access Your Dashboard
                </Button>
              </Link>
              <Link to="/reports">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesHomePage;
