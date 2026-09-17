import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Crown, ArrowLeft, MessageCircle, Bell, Sparkles } from "lucide-react";

interface PlaceholderPageProps {
  section: string;
}

const PlaceholderPage = ({ section }: PlaceholderPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sheraton-cream to-background">
      <div className="container py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Main Content */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <Crown className="h-16 w-16 text-sheraton-gold" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-sheraton-navy mb-6">
              {section}
            </h1>

            <div className="sheraton-gradient rounded-2xl p-8 text-white mb-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">
                Coming Soon - Something Special!
              </h2>
              <p className="text-lg text-white/90 leading-relaxed">
                We're crafting an extraordinary {section.toLowerCase()}{" "}
                experience that will make you feel truly special. Every detail
                is being designed with your comfort and satisfaction in mind.
              </p>
            </div>
          </div>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-sheraton-gold border-2">
              <CardHeader className="text-center">
                <Crown className="h-8 w-8 text-sheraton-gold mx-auto mb-2" />
                <CardTitle className="text-sheraton-navy">
                  Premium Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Luxury experiences designed exclusively for our special guests
                </p>
              </CardContent>
            </Card>

            <Card className="border-sheraton-gold border-2">
              <CardHeader className="text-center">
                <Bell className="h-8 w-8 text-sheraton-gold mx-auto mb-2" />
                <CardTitle className="text-sheraton-navy">
                  Smart Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Get notified when this feature launches with exclusive offers
                </p>
              </CardContent>
            </Card>

            <Card className="border-sheraton-gold border-2">
              <CardHeader className="text-center">
                <MessageCircle className="h-8 w-8 text-sheraton-gold mx-auto mb-2" />
                <CardTitle className="text-sheraton-navy">
                  Personal Touch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Customized to your preferences and special requirements
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="bg-white rounded-2xl p-8 luxury-shadow">
            <h3 className="text-2xl font-bold text-sheraton-navy mb-4">
              Stay Updated on {section}
            </h3>
            <p className="text-muted-foreground mb-6">
              Want to be the first to know when {section.toLowerCase()} becomes
              available? We'll notify you with exclusive launch offers and
              special previews.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/profile">
                <Button className="sheraton-gradient text-white px-6 py-3">
                  <Bell className="mr-2 h-4 w-4" />
                  Get Notified
                </Button>
              </Link>
              <Link to="/blog">
                <Button variant="outline" className="px-6 py-3">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Join Community
                </Button>
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Need assistance with something else? We're here to help 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/menu">
                <Button
                  variant="ghost"
                  className="text-sheraton-gold hover:text-sheraton-gold-dark"
                >
                  Browse Digital Menu
                </Button>
              </Link>
              <Link to="/book">
                <Button
                  variant="ghost"
                  className="text-sheraton-gold hover:text-sheraton-gold-dark"
                >
                  Book Your Stay
                </Button>
              </Link>
              <Link to="/concierge">
                <Button
                  variant="ghost"
                  className="text-sheraton-gold hover:text-sheraton-gold-dark"
                >
                  Contact Concierge
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
