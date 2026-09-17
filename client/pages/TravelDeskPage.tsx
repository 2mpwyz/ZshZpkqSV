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
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Separator } from "../components/ui/separator";
import {
  Crown,
  MapPin,
  Plane,
  Camera,
  Mountain,
  TreePine,
  Waves,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Star,
  Heart,
  Share2,
  Download,
  Plus,
  Minus,
  Filter,
  Search,
  Map,
  Navigation,
  Compass,
  Car,
  Bus,
  Train,
  Ship,
  Bike,
  Walking,
  Coffee,
  Utensils,
  Building,
  Camera as CameraIcon,
  Music,
  Palette,
  ShoppingBag,
  Gamepad2,
  BookOpen,
  Zap,
  CheckCircle,
  Globe,
  Phone,
  Mail,
  CreditCard,
  Gift,
  AlertCircle,
      Info,
  Shield,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  FileText,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "../lib/utils";
import TravelCheckoutModal from "../components/travel/TravelCheckoutModal";

const TravelDeskPage = () => {
  const [activeTab, setActiveTab] = useState("experiences");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showItinerary, setShowItinerary] = useState(false);
  const [showTravelCheckout, setShowTravelCheckout] = useState(false);

  const experienceCategories = [
    { id: "all", name: "All Experiences", icon: Globe },
    { id: "adventure", name: "Adventure", icon: Mountain },
    { id: "culture", name: "Culture & Arts", icon: Palette },
    { id: "nature", name: "Nature", icon: TreePine },
    { id: "relaxation", name: "Relaxation", icon: Coffee },
    { id: "dining", name: "Fine Dining", icon: Utensils },
    { id: "entertainment", name: "Entertainment", icon: Music },
  ];

  const experiences = [
    {
      id: "EXP001",
      title: "Sunset Safari Adventure",
      description:
        "Exclusive wildlife safari with professional guide and sunset dinner",
      duration: "8 hours",
      price: 299,
      originalPrice: 399,
      category: "adventure",
      rating: 4.9,
      reviews: 234,
      image: "🦁",
      included: [
        "Professional safari guide",
        "4x4 safari vehicle",
        "Sunset dinner",
        "Photography equipment",
        "Hotel transfers",
      ],
      highlights: [
        "Big Five wildlife viewing",
        "Professional photography tips",
        "Authentic bush dinner",
        "Small group experience (max 6 guests)",
      ],
      availability: "Daily",
      meetingPoint: "Hotel Lobby",
      cancellation: "Free cancellation up to 24 hours",
      difficulty: "Easy",
      ageRestriction: "All ages welcome",
      whatToBring: ["Comfortable shoes", "Sun hat", "Camera"],
      partnerId: "SAFARI_EXPERTS",
    },
    {
      id: "EXP002",
      title: "Helicopter City Tour",
      description: "Breathtaking aerial views of the city's landmarks",
      duration: "45 minutes",
      price: 450,
      originalPrice: 550,
      category: "adventure",
      rating: 4.8,
      reviews: 186,
      image: "🚁",
      included: [
        "45-minute helicopter flight",
        "Professional pilot guide",
        "Safety briefing",
        "Complimentary photos",
        "Certificate of flight",
      ],
      highlights: [
        "360-degree city views",
        "Famous landmarks from above",
        "Professional commentary",
        "Perfect for special occasions",
      ],
      availability: "Daily (weather permitting)",
      meetingPoint: "City Helipad (transport provided)",
      cancellation: "Free cancellation up to 48 hours",
      difficulty: "Easy",
      ageRestriction: "Minimum age 5 years",
      whatToBring: ["Photo ID", "Comfortable clothing"],
      partnerId: "SKY_TOURS",
    },
    {
      id: "EXP003",
      title: "Cultural Heritage Walking Tour",
      description:
        "Discover the rich history and culture with local expert guides",
      duration: "3 hours",
      price: 89,
      originalPrice: 120,
      category: "culture",
      rating: 4.7,
      reviews: 342,
      image: "🏛️",
      included: [
        "Expert local guide",
        "Museum entrance fees",
        "Traditional snacks",
        "Digital guidebook",
        "Group photos",
      ],
      highlights: [
        "Historic architecture",
        "Local artisan workshops",
        "Traditional market visit",
        "Authentic cultural insights",
      ],
      availability: "Tuesday, Thursday, Saturday",
      meetingPoint: "Central Plaza",
      cancellation: "Free cancellation up to 24 hours",
      difficulty: "Moderate (walking involved)",
      ageRestriction: "All ages welcome",
      whatToBring: ["Comfortable walking shoes", "Water bottle"],
      partnerId: "CULTURE_WALKS",
    },
    {
      id: "EXP004",
      title: "Spa & Wellness Retreat",
      description: "Rejuvenating full-day wellness experience in nature",
      duration: "6 hours",
      price: 350,
      originalPrice: 450,
      category: "relaxation",
      rating: 4.9,
      reviews: 156,
      image: "🧘",
      included: [
        "Full body massage",
        "Meditation session",
        "Healthy gourmet lunch",
        "Yoga class",
        "Wellness consultation",
      ],
      highlights: [
        "Award-winning spa treatments",
        "Organic wellness cuisine",
        "Mindfulness training",
        "Natural setting",
      ],
      availability: "Monday, Wednesday, Friday",
      meetingPoint: "Wellness Center (transport included)",
      cancellation: "Free cancellation up to 48 hours",
      difficulty: "Easy",
      ageRestriction: "Adults only (18+)",
      whatToBring: ["Comfortable clothing", "Swimwear"],
      partnerId: "ZEN_RETREATS",
    },
    {
      id: "EXP005",
      title: "Michelin Star Culinary Experience",
      description:
        "Exclusive chef's table experience at award-winning restaurant",
      duration: "4 hours",
      price: 280,
      originalPrice: 350,
      category: "dining",
      rating: 5.0,
      reviews: 89,
      image: "👨‍🍳",
      included: [
        "7-course tasting menu",
        "Wine pairing",
        "Chef interaction",
        "Kitchen tour",
        "Recipe cards",
      ],
      highlights: [
        "Michelin-starred cuisine",
        "Meet the head chef",
        "Premium wine selection",
        "Exclusive kitchen access",
      ],
      availability: "Friday & Saturday only",
      meetingPoint: "Restaurant (transport provided)",
      cancellation: "72 hours advance notice required",
      difficulty: "Easy",
      ageRestriction: "Adults preferred",
      whatToBring: ["Smart casual attire required"],
      partnerId: "FINE_DINING_CO",
    },
  ];

  const travelServices = [
    {
      id: "TS001",
      title: "Airport Transfer Service",
      description: "Luxury vehicle transfer to/from airport",
      price: 89,
      icon: Car,
      category: "transport",
    },
    {
      id: "TS002",
      title: "City Transport Pass",
      description: "Unlimited public transport for 3 days",
      price: 45,
      icon: Bus,
      category: "transport",
    },
    {
      id: "TS003",
      title: "Visa Processing Assistance",
      description: "Help with visa applications and documentation",
      price: 150,
      icon: FileText,
      category: "services",
    },
    {
      id: "TS004",
      title: "Travel Insurance",
      description: "Comprehensive travel protection coverage",
      price: 89,
      icon: Shield,
      category: "services",
    },
  ];

  const partnerTours = [
    {
      name: "Safari Experts",
      rating: 4.9,
      tours: 12,
      specialties: ["Wildlife", "Photography", "Adventure"],
      badge: "Verified Partner",
    },
    {
      name: "Sky Tours",
      rating: 4.8,
      tours: 8,
      specialties: ["Aerial Tours", "Scenic Flights", "Adventure"],
      badge: "Premium Partner",
    },
    {
      name: "Culture Walks",
      rating: 4.7,
      tours: 15,
      specialties: ["History", "Culture", "Walking Tours"],
      badge: "Local Expert",
    },
  ];

  const filteredExperiences = experiences.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (experienceId: string) => {
    setCart((prev) => ({
      ...prev,
      [experienceId]: (prev[experienceId] || 0) + 1,
    }));
  };

  const removeFromCart = (experienceId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[experienceId] > 1) {
        newCart[experienceId]--;
      } else {
        delete newCart[experienceId];
      }
      return newCart;
    });
  };

  const updateCart = (experienceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartCompletely(experienceId);
    } else {
      setCart((prev) => ({
        ...prev,
        [experienceId]: quantity,
      }));
    }
  };

  const removeFromCartCompletely = (experienceId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[experienceId];
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [expId, quantity]) => {
      const experience = experiences.find((e) => e.id === expId);
      return total + (experience ? experience.price * quantity : 0);
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sheraton-cream to-background">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-sheraton-gold mr-2" />
            <Badge className="bg-sheraton-gold text-sheraton-navy px-4 py-2">
              Travel & Experiences
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-sheraton-navy mb-4">
            Discover Amazing Experiences
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Curated adventures, cultural experiences, and exclusive access to
            the best local attractions. Book seamlessly with your hotel stay for
            special guest pricing.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1">
            <TabsTrigger
              value="experiences"
              className="flex items-center gap-2 py-3"
            >
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Experiences</span>
            </TabsTrigger>
            <TabsTrigger
              value="transport"
              className="flex items-center gap-2 py-3"
            >
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Transport</span>
            </TabsTrigger>
            <TabsTrigger
              value="itinerary"
              className="flex items-center gap-2 py-3"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Itinerary</span>
            </TabsTrigger>
            <TabsTrigger
              value="partners"
              className="flex items-center gap-2 py-3"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Partners</span>
            </TabsTrigger>
            <TabsTrigger
              value="support"
              className="flex items-center gap-2 py-3"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
          </TabsList>

          {/* Experiences Tab */}
          <TabsContent value="experiences" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-sheraton-gold" />
                      Find Experiences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Search experiences..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <div className="space-y-2">
                      <Label>Category</Label>
                      <div className="space-y-2">
                        {experienceCategories.map((category) => (
                          <Button
                            key={category.id}
                            variant={
                              selectedCategory === category.id
                                ? "default"
                                : "ghost"
                            }
                            className={`w-full justify-start gap-2 ${
                              selectedCategory === category.id
                                ? "sheraton-gradient text-white"
                                : ""
                            }`}
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            <category.icon className="h-4 w-4" />
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate
                              ? format(selectedDate, "PPP")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardContent>
                </Card>

                {/* Special Offers */}
                <Card className="border-sheraton-gold">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sheraton-gold">
                      <Gift className="h-5 w-5" />
                      Special Guest Offers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-sheraton-gold/10 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">
                        Stay Package Deal
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Book experiences with your room for extra 15% off
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-1">
                        Group Discount
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        4+ guests get automatic 20% discount
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Experience Cards */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredExperiences.map((experience) => (
                    <Card
                      key={experience.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-0">
                        <div className="relative">
                          <div className="h-48 bg-gradient-to-br from-sheraton-gold/20 to-sheraton-navy/20 flex items-center justify-center">
                            <div className="text-6xl">{experience.image}</div>
                          </div>
                          <Badge className="absolute top-4 right-4 bg-sheraton-gold text-sheraton-navy">
                            Special Price
                          </Badge>
                        </div>

                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-sheraton-navy mb-2">
                                {experience.title}
                              </h3>
                              <p className="text-muted-foreground text-sm mb-3">
                                {experience.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {experience.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  {experience.rating} ({experience.reviews})
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground line-through">
                                  ${experience.originalPrice}
                                </span>
                                <span className="text-2xl font-bold text-sheraton-navy">
                                  ${experience.price}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">
                                Highlights:
                              </h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {experience.highlights
                                  .slice(0, 3)
                                  .map((highlight, index) => (
                                    <li
                                      key={index}
                                      className="flex items-center gap-2"
                                    >
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      {highlight}
                                    </li>
                                  ))}
                              </ul>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                {experience.availability}
                              </span>
                              <span className="text-green-600 font-medium">
                                {experience.cancellation
                                  .split(" ")
                                  .slice(0, 4)
                                  .join(" ")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {cart[experience.id] ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeFromCart(experience.id)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {cart[experience.id]}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addToCart(experience.id)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                onClick={() => addToCart(experience.id)}
                                className="sheraton-gradient text-white"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Book Experience
                              </Button>
                            )}

                            <Button variant="outline" size="sm">
                              <Info className="h-4 w-4 mr-2" />
                              Details
                            </Button>

                            <Button variant="ghost" size="sm">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Transport Tab */}
          <TabsContent value="transport" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {travelServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader className="text-center">
                    <service.icon className="h-12 w-12 mx-auto mb-4 text-sheraton-gold" />
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">
                      {service.description}
                    </p>
                    <div className="text-2xl font-bold text-sheraton-navy mb-4">
                      ${service.price}
                    </div>
                    <Button className="w-full sheraton-gradient text-white">
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-sheraton-gold" />
                  Create Your Personal Itinerary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          Select date
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1day">1 Day</SelectItem>
                        <SelectItem value="2days">2 Days</SelectItem>
                        <SelectItem value="3days">3 Days</SelectItem>
                        <SelectItem value="week">1 Week</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Travelers</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Number of travelers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Person</SelectItem>
                        <SelectItem value="2">2 People</SelectItem>
                        <SelectItem value="3-4">3-4 People</SelectItem>
                        <SelectItem value="5+">5+ People</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Interests & Preferences</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {experienceCategories.slice(1).map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox id={category.id} />
                        <Label htmlFor={category.id} className="text-sm">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Special Requirements</Label>
                  <Textarea
                    placeholder="Any special needs, dietary restrictions, or preferences..."
                    rows={3}
                  />
                </div>

                <Button className="w-full sheraton-gradient text-white">
                  <Zap className="h-4 w-4 mr-2" />
                  Generate AI-Powered Itinerary
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {partnerTours.map((partner, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{partner.name}</CardTitle>
                      <Badge className="sheraton-gradient text-white">
                        {partner.badge}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{partner.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {partner.tours} tours
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Specialties:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {partner.specialties.map((specialty, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View All Tours
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-sheraton-gold" />
                    Travel Desk Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Travel Concierge</div>
                        <div className="text-sm text-muted-foreground">
                          24/7 assistance
                        </div>
                      </div>
                      <Button size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Email Support</div>
                        <div className="text-sm text-muted-foreground">
                          travel@sheraton-special.com
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">WhatsApp</div>
                        <div className="text-sm text-muted-foreground">
                          Instant messaging
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-50"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-sheraton-gold" />
                    Additional Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Visa Processing Help
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Travel Insurance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Map className="h-4 w-4 mr-2" />
                    Custom Itineraries
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Group Bookings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Gift className="h-4 w-4 mr-2" />
                    Special Occasions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Floating Booking Summary */}
        {getTotalItems() > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <Card className="sheraton-gradient text-white border-0 luxury-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <ShoppingBag className="h-6 w-6" />
                    <Badge className="absolute -top-2 -right-2 bg-white text-sheraton-navy min-w-[20px] h-5 p-0 flex items-center justify-center text-xs">
                      {getTotalItems()}
                    </Badge>
                  </div>
                  <div>
                    <div className="font-semibold">${getTotalPrice()}</div>
                    <div className="text-xs text-white/80">
                      {getTotalItems()} experiences
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white text-sheraton-navy hover:bg-white/90"
                    onClick={() => setShowTravelCheckout(true)}
                  >
                    Book All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <TravelCheckoutModal
          isOpen={showTravelCheckout}
          onClose={() => setShowTravelCheckout(false)}
          cart={cart}
          experiences={experiences}
          onUpdateCart={updateCart}
          onRemoveFromCart={removeFromCartCompletely}
          onClearCart={clearCart}
        />
      </div>
    </div>
  );
};

export default TravelDeskPage;
