import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import QuickFeedback from "../feedback/QuickFeedback";
import {
  Briefcase,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Award,
  Shield,
  Zap,
} from "lucide-react";

const ServicesFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sheraton-navy text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-sheraton-gold" />
              <div className="flex flex-col">
                <span className="text-xl font-bold">Service Platform</span>
                <span className="text-xs text-sheraton-gold font-medium tracking-wide">
                  OPERATIONS
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              Empower your service delivery with intelligent task management, 
              real-time analytics, and comprehensive operational tools designed 
              for property managers and service providers.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-sheraton-gold"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-sheraton-gold"
              >
                <Instagram className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-sheraton-gold"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-sheraton-gold"
              >
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links - Operational */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-sheraton-gold">
              Management Tools
            </h3>
            <nav className="flex flex-col space-y-2">
              <Link
                to="/tasks/list"
                className="text-sm text-gray-300 hover:text-sheraton-gold transition-colors"
              >
                View Tasks
              </Link>
              <Link
                to="/tasks/new"
                className="text-sm text-gray-300 hover:text-sheraton-gold transition-colors"
              >
                Create Task
              </Link>
              <Link
                to="/reports"
                className="text-sm text-gray-300 hover:text-sheraton-gold transition-colors"
              >
                Performance Reports
              </Link>
              <Link
                to="/accounts"
                className="text-sm text-gray-300 hover:text-sheraton-gold transition-colors"
              >
                Team Management
              </Link>
              <Link
                to="/profile"
                className="text-sm text-gray-300 hover:text-sheraton-gold transition-colors"
              >
                Account Settings
              </Link>
            </nav>
          </div>

          {/* Services & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-sheraton-gold">
              Support & Resources
            </h3>
            <nav className="flex flex-col space-y-2">
              <Link
                to="/profile"
                className="text-sm text-gray-300 hover:text-sheraton-gold transition-colors"
              >
                User Profile
              </Link>
              <Link
                to="/reports"
                className="text-sm text-gray-300 hover:text-sheraton-gold transition-colors"
              >
                Analytics Dashboard
              </Link>
              <Link
                to="/tasks/list"
                className="text-sm text-gray-300 hover:text-sheraton-gold transition-colors"
              >
                Task Tracking
              </Link>
              <Link
                to="/accounts"
                className="text-sm text-gray-300 hover:text-sheraton-gold transition-colors"
              >
                Team Coordination
              </Link>
              <Link
                to="/profile"
                className="text-sm text-gray-300 hover:text-sheraton-gold transition-colors"
              >
                Help Center
              </Link>
            </nav>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-sheraton-gold">
              Get in Touch
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Phone className="h-4 w-4 text-sheraton-gold" />
                <span>+1 (555) OPERATIONS</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Mail className="h-4 w-4 text-sheraton-gold" />
                <span>support@serviceplatform.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-sheraton-gold" />
                <span>Operations Center, Management City</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-sheraton-gold">
                Stay Updated
              </p>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button className="sheraton-gradient">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-sheraton-gold" />
                <span>Enterprise Grade</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-sheraton-gold" />
                <span>Secure & Reliable</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-sheraton-gold" />
                <span>Rapid Support</span>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-300">
              <Link
                to="/privacy"
                className="hover:text-sheraton-gold transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-sheraton-gold transition-colors"
              >
                Terms of Service
              </Link>
              <span>
                © {currentYear} Service Platform. All rights reserved.
              </span>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            <p>
              Streamlining property management through intelligent task coordination, 
              real-time analytics, and superior service delivery.
              <br />
              Your operational excellence starts here.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Feedback Button */}
      <QuickFeedback section="Overall Experience" position="bottom-right" />
    </footer>
  );
};

export default ServicesFooter;
