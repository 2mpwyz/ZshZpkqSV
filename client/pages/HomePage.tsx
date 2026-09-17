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
  Crown,
  Hotel,
  Utensils,
  MapPin,
  Calendar,
  ShoppingBag,
  Users,
  Heart,
  Star,
  Gift,
  Coffee,
  Sparkles,
  Clock,
  QrCode,
  Bell,
  Award,
  Zap,
  Shield,
  Wifi,
} from "lucide-react";

interface HomePageProps {
  displayName?: string;
}

const HomePage = ({ displayName = "Special Guest" }: HomePageProps) => {
  const [timeOfDay, setTimeOfDay] = useState("");
  const [currentOffer, setCurrentOffer] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("morning");
    else if (hour < 17) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");
  }, []);

  const specialOffers = [
    {
      title: "Welcome Special",
      description: "25% off your first stay + complimentary spa access",
      time: "Limited Time",
      icon: Crown,
      color: "text-sheraton-gold",
    },
    {
      title: "Lunch Special",
      description: "Buy one, get one free on signature dishes",
      time: "Until 3 PM",
      icon: Utensils,
      color: "text-green-500",
    },
    {
      title: "Evening Delight",
      description: "Live jazz band + 30% off premium cocktails",
      time: "7 PM - 11 PM",
      icon: Coffee,
      color: "text-purple-500",
    },
  ];

  const specialFeatures = [
    {
      title: "Instant Room Access",
      description: "Skip the front desk with QR code room entry",
      icon: QrCode,
      href: "/book",
      gradient: "from-blue-500 to-purple-600",
    },
    {
      title: "Digital Menu",
      description: "Order ahead and skip queues - you come first!",
      icon: Utensils,
      href: "/menu",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Personal Concierge",
      description: "24/7 AI-powered assistance for special requests",
      icon: Crown,
      href: "/concierge",
      gradient: "from-gold-500 to-yellow-600",
    },
    {
      title: "Loyalty Rewards",
      description: "Earn points, get special treatment, cash out benefits",
      icon: Gift,
      href: "/profile",
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  const specialExperiences = [
    {
      title: "Curated Travel",
      description: "Exclusive local experiences & adventures",
      icon: MapPin,
      href: "/travel",
      image: "🏔️",
    },
    {
      title: "Special Events",
      description: "Create memorable celebrations with us",
      icon: Calendar,
      href: "/events",
      image: "🎉",
    },
    {
      title: "Exclusive Boutique",
      description: "Luxury souvenirs & local artisan crafts",
      icon: ShoppingBag,
      href: "/shop",
      image: "🛍️",
    },
    {
      title: "Special Community",
      description: "Connect with fellow special guests",
      icon: Users,
      href: "/blog",
      image: "👥",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % specialOffers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const CurrentOfferIcon = specialOffers[currentOffer].icon;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden sheraton-hero-gradient">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex items-center justify-center mb-6">
              <Crown className="h-12 w-12 text-sheraton-gold mr-4" />
              <Badge className="bg-sheraton-gold text-sheraton-navy text-lg px-4 py-2">
                You Are Special
              </Badge>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {getGreeting()},
              <br />
              <span className="text-shimmer">{displayName}</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              Welcome to Sheraton Special - where technology meets hospitality
              to create extraordinary moments that make you feel truly special,
              every single time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/book">
                <Button
                  size="lg"
                  className="sheraton-gradient text-white px-8 py-6 text-lg font-semibold luxury-shadow"
                >
                  <Hotel className="mr-2 h-5 w-5" />
                  Book Your Special Stay
                </Button>
              </Link>
              <Link to="/menu">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-effect border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  Quick Menu Access
                </Button>
              </Link>
            </div>

            {/* Current Special Offer */}
            <div className="glass-effect rounded-2xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CurrentOfferIcon
                    className={`h-5 w-5 ${specialOffers[currentOffer].color}`}
                  />
                  <span className="font-semibold">
                    {specialOffers[currentOffer].title}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {specialOffers[currentOffer].time}
                </Badge>
              </div>
              <p className="text-sm text-white/80">
                {specialOffers[currentOffer].description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Special Features Grid */}
      <section className="py-20 bg-gradient-to-b from-background to-sheraton-cream">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sheraton-navy mb-4">
              What Makes You Special
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience exclusive features designed to make every moment of
              your stay effortless, personalized, and truly memorable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialFeatures.map((feature, index) => (
              <Link key={index} to={feature.href}>
                <Card className="group transition-shadow duration-300 luxury-shadow hover:shadow-2xl border-0 overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${feature.gradient}`} />
                  <CardHeader className="text-center">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}
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

      {/* Special Experiences */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-sheraton-navy mb-4">
              Discover Special Experiences
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Beyond accommodation - explore curated experiences that create
              lasting memories and connections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialExperiences.map((experience, index) => (
              <Link key={index} to={experience.href}>
                <Card className="group transition-shadow duration-300 luxury-shadow hover:shadow-2xl border-0 overflow-hidden">
                  <CardHeader className="text-center">
                    <div className="text-6xl mb-4">
                      {experience.image}
                    </div>
                    <CardTitle className="text-sheraton-navy flex items-center justify-center gap-2">
                      <experience.icon className="h-5 w-5 text-sheraton-gold" />
                      {experience.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground">
                      {experience.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Updates & Notifications */}
      <section className="py-20 bg-sheraton-cream">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-sheraton-navy mb-4">
                Stay Connected, Stay Special
              </h2>
              <p className="text-lg text-muted-foreground">
                Real-time updates and personalized notifications keep you in the
                loop for all special moments and exclusive offers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center p-6 border-sheraton-gold border-2">
                <Bell className="h-12 w-12 text-sheraton-gold mx-auto mb-4" />
                <h3 className="font-semibold text-sheraton-navy mb-2">
                  Smart Notifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get timely alerts for meals, events, and special offers
                </p>
              </Card>

              <Card className="text-center p-6 border-sheraton-gold border-2">
                <Zap className="h-12 w-12 text-sheraton-gold mx-auto mb-4" />
                <h3 className="font-semibold text-sheraton-navy mb-2">
                  Instant Booking
                </h3>
                <p className="text-sm text-muted-foreground">
                  Skip queues and get priority access to everything
                </p>
              </Card>

              <Card className="text-center p-6 border-sheraton-gold border-2">
                <Heart className="h-12 w-12 text-sheraton-gold mx-auto mb-4" />
                <h3 className="font-semibold text-sheraton-navy mb-2">
                  Personal Touch
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customized experiences based on your preferences
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Excellence */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-sheraton-navy mb-4">
                Why Sheraton Special?
              </h2>
              <p className="text-lg text-muted-foreground">
                Experience the perfect blend of luxury, technology, and
                personalized service
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full sheraton-gradient flex items-center justify-center">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-sheraton-navy">
                  5-Star Luxury
                </h3>
                <p className="text-sm text-muted-foreground">
                  Uncompromising quality
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full sheraton-gradient flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-sheraton-navy">
                  Secure & Private
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your data protected
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full sheraton-gradient flex items-center justify-center">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-sheraton-navy">
                  24/7 Service
                </h3>
                <p className="text-sm text-muted-foreground">
                  Always here for you
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full sheraton-gradient flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-sheraton-navy">
                  Special Status
                </h3>
                <p className="text-sm text-muted-foreground">
                  You deserve the best
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Services Support Section */}
      <section className="border-t border-orange-200 bg-orange-50 py-12 dark:border-orange-800 dark:bg-orange-950/30">
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
            <Crown className="h-16 w-16 mx-auto mb-6 text-white" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Feel Special?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join our community of special guests and discover what makes every
              stay an extraordinary experience. Your journey to feeling truly
              special starts now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/profile">
                <Button
                  size="lg"
                  className="bg-white text-sheraton-navy hover:bg-white/90 dark:text-sheraton-navy px-8 py-6 text-lg font-semibold"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Create Your Special Account
                </Button>
              </Link>
              <Link to="/book">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  <Hotel className="mr-2 h-5 w-5" />
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
