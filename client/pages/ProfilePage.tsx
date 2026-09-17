import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { supabase } from "../lib/supabase";
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
import { Switch } from "../components/ui/switch";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import {
  Crown,
  Gift,
  Star,
  Heart,
  Calendar,
  CreditCard,
  Download,
  Settings,
  Bell,
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Wallet,
  TrendingUp,
  Award,
  Share2,
  Copy,
  Receipt,
  History,
  Cake,
  Sparkles,
  Target,
  Users,
  Coffee,
  Hotel,
  Utensils,
  ShoppingBag,
  Plane,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { format, addDays } from "date-fns";

const ProfilePageDisabled = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [showLoyaltyDetails, setShowLoyaltyDetails] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const saveTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  const userIdRef = useRef<string | null>(null);

  // User data from database
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthday: "",
    location: "",
    memberSince: new Date().toISOString().split('T')[0],
    profilePicture: "",
    preferences: {
      roomType: "deluxe",
      bedType: "king",
      floor: "high",
      theme: "modern",
      notifications: {
        offers: true,
        events: true,
        birthday: true,
        newsletter: false,
      },
    },
  });

  // Save field to database with debounce
  const saveFieldToDatabase = async (fieldName: string, value: string) => {
    if (!userIdRef.current) return;

    // Clear existing timeout for this field
    if (saveTimeoutsRef.current[fieldName]) {
      clearTimeout(saveTimeoutsRef.current[fieldName]);
    }

    // Debounce the save by 500ms
    saveTimeoutsRef.current[fieldName] = setTimeout(async () => {
      try {
        const dbFieldName = fieldName === 'firstName' ? 'first_name' :
                           fieldName === 'lastName' ? 'last_name' : fieldName;

        await supabase
          .from("user_profiles")
          .update({ [dbFieldName]: value })
          .eq("user_id", userIdRef.current);
      } catch (error) {
        console.error(`Error saving ${fieldName}:`, error);
      }
    }, 500);
  };

  // Fetch user profile data from Supabase
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          navigate("/login");
          return;
        }

        userIdRef.current = user.id;

        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (profile) {
          setUserData((prev) => ({
            ...prev,
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            email: user.email || "",
            phone: profile.phone || "",
            birthday: profile.birthday || "",
            location: profile.location || "",
            memberSince: profile.created_at ? profile.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            profilePicture: profile.profile_picture || "",
          }));
          setDataLoaded(true);
        }
      } catch (error) {
        navigate("/login");
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimeoutsRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const loyaltyData = {
    currentPoints: 12500,
    pointsToNextTier: 2500,
    currentTier: "Gold Special",
    nextTier: "Platinum Special",
    lifetimePoints: 45000,
    tierProgress: 83,
    membershipLevel: 3,
    benefits: [
      "Priority booking access",
      "25% off dining",
      "Free room upgrades (subject to availability)",
      "Late checkout until 2 PM",
      "Complimentary spa access",
      "Personal concierge service",
    ],
    nextTierBenefits: [
      "All Gold benefits",
      "50% off dining",
      "Guaranteed room upgrades",
      "Late checkout until 4 PM",
      "Free airport transfers",
      "Annual free night stay",
    ],
  };

  const recentTransactions = [
    {
      id: "1",
      type: "earning",
      description: "Room booking - Presidential Suite",
      amount: "+850 pts",
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: "2",
      type: "earning",
      description: "Dining - Truffle Pasta & Wine",
      amount: "+125 pts",
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: "3",
      type: "redemption",
      description: "Redeemed for Spa Treatment",
      amount: "-500 pts",
      date: "2024-01-10",
      status: "completed",
    },
    {
      id: "4",
      type: "earning",
      description: "Review & Photo Testimonial",
      amount: "+200 pts",
      date: "2024-01-08",
      status: "completed",
    },
    {
      id: "5",
      type: "earning",
      description: "Friend Referral - Sarah M.",
      amount: "+1000 pts",
      date: "2024-01-05",
      status: "completed",
    },
  ];

  const upcomingOffers = [
    {
      id: "1",
      title: "Birthday Celebration Special",
      description: "Free birthday cake + 30% off dinner for two",
      validUntil: "2024-03-15",
      type: "birthday",
      emoji: "🎂",
    },
    {
      id: "2",
      title: "Gold Member Exclusive",
      description: "Complimentary spa day with any 2-night stay",
      validUntil: "2024-02-29",
      type: "tier",
      emoji: "💆",
    },
    {
      id: "3",
      title: "Friend Referral Bonus",
      description: "Earn 1000 points for each successful referral",
      validUntil: "Ongoing",
      type: "referral",
      emoji: "👥",
    },
  ];

  const pointEarningActivities = [
    {
      activity: "Room Booking",
      points: "10 points per $1 spent",
      icon: Hotel,
    },
    {
      activity: "Dining",
      points: "5 points per $1 spent",
      icon: Utensils,
    },
    {
      activity: "Spa Services",
      points: "8 points per $1 spent",
      icon: Sparkles,
    },
    {
      activity: "Events & Activities",
      points: "6 points per $1 spent",
      icon: Calendar,
    },
    {
      activity: "Reviews with Photos",
      points: "200 bonus points",
      icon: Star,
    },
    {
      activity: "Friend Referrals",
      points: "1000 bonus points",
      icon: Users,
    },
  ];

  const getBirthdayCountdown = () => {
    if (!userData.birthday) return 0;

    const today = new Date();
    const currentYear = today.getFullYear();
    const [year, month, day] = userData.birthday.split('-');
    const birthday = new Date(currentYear, parseInt(month) - 1, parseInt(day));

    if (birthday < today) {
      birthday.setFullYear(currentYear + 1);
    }

    const daysUntil = Math.ceil(
      (birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntil;
  };

  const birthdayCountdown = getBirthdayCountdown();

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  const generateReferralCode = () => {
    return "ALEX-SPECIAL-2024";
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(generateReferralCode());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sheraton-cream to-background">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-sheraton-gold mr-2" />
            <Badge className="bg-sheraton-gold text-sheraton-navy px-4 py-2">
              Special Guest Member
            </Badge>
          </div>
          {userData.firstName && (
            <h1 className="text-4xl md:text-5xl font-bold text-sheraton-navy mb-4">
              Welcome back, {userData.firstName}!
            </h1>
          )}
          <p className="text-lg text-muted-foreground">
            Your special journey continues • {loyaltyData.currentTier} Member
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto p-1">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 py-3"
            >
              <Crown className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="loyalty"
              className="flex items-center gap-2 py-3"
            >
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Loyalty</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 py-3"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-2 py-3"
            >
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex items-center gap-2 py-3"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger
              value="referrals"
              className="flex items-center gap-2 py-3"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Refer</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Summary */}
              <Card className="lg:col-span-1">
                <CardHeader className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={userData.profilePicture} />
                      <AvatarFallback className="text-2xl font-bold bg-sheraton-gold text-sheraton-navy">
                        {userData.firstName[0]}
                        {userData.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 sheraton-gradient"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-sheraton-navy">
                    {userData.firstName} {userData.lastName}
                  </CardTitle>
                  <Badge className="sheraton-gradient text-white">
                    {loyaltyData.currentTier}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-sheraton-gold mb-1">
                      {loyaltyData.currentPoints.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Available Points
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to {loyaltyData.nextTier}</span>
                      <span>{loyaltyData.tierProgress}%</span>
                    </div>
                    <Progress
                      value={loyaltyData.tierProgress}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      {loyaltyData.pointsToNextTier} points to next tier
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">
                        {format(new Date(userData.memberSince), "MMM yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Member Since
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {loyaltyData.lifetimePoints.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Lifetime Points
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions & Special Offers */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-sheraton-gold" />
                    Your Special Moments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Birthday Countdown */}
                  {birthdayCountdown <= 30 && (
                    <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Cake className="h-5 w-5 text-pink-500" />
                        <h3 className="font-semibold text-pink-700">
                          Birthday Celebration Coming Up!
                        </h3>
                      </div>
                      <p className="text-sm text-pink-600 mb-3">
                        Your special day is in {birthdayCountdown} days! We have
                        a surprise waiting for you.
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-pink-500 hover:bg-pink-600 text-white"
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          View Birthday Offer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-pink-300 text-pink-600"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Plan Celebration
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/book">
                      <Button className="w-full h-20 flex flex-col gap-2 sheraton-gradient text-white">
                        <Hotel className="h-6 w-6" />
                        <span className="text-xs">Book Stay</span>
                      </Button>
                    </Link>
                    <Link to="/menu">
                      <Button
                        className="w-full h-20 flex flex-col gap-2"
                        variant="outline"
                      >
                        <Utensils className="h-6 w-6 text-sheraton-gold" />
                        <span className="text-xs">Order Food</span>
                      </Button>
                    </Link>
                    <Link to="/spa">
                      <Button
                        className="w-full h-20 flex flex-col gap-2"
                        variant="outline"
                      >
                        <Sparkles className="h-6 w-6 text-sheraton-gold" />
                        <span className="text-xs">Book Spa</span>
                      </Button>
                    </Link>
                    <Link to="/events">
                      <Button
                        className="w-full h-20 flex flex-col gap-2"
                        variant="outline"
                      >
                        <Calendar className="h-6 w-6 text-sheraton-gold" />
                        <span className="text-xs">Events</span>
                      </Button>
                    </Link>
                  </div>

                  {/* Current Offers */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sheraton-navy">
                      Exclusive Offers For You
                    </h3>
                    {upcomingOffers.slice(0, 2).map((offer) => (
                      <div
                        key={offer.id}
                        className="flex items-center justify-between p-3 bg-sheraton-gold/10 rounded-lg border border-sheraton-gold/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{offer.emoji}</div>
                          <div>
                            <h4 className="font-medium text-sheraton-navy">
                              {offer.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {offer.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="sheraton-gradient text-white"
                        >
                          Claim
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-sheraton-gold" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.slice(0, 3).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "earning"
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {transaction.type === "earning" ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <Gift className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {transaction.description}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.date), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-semibold ${
                          transaction.type === "earning"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Transactions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loyalty Tab */}
          <TabsContent value="loyalty" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Points Wallet */}
              <Card className="sheraton-gradient text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Your Points Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {loyaltyData.currentPoints.toLocaleString()}
                    </div>
                    <div className="text-white/80">Available Points</div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">$125</div>
                      <div className="text-xs text-white/70">Cash Value</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">45K</div>
                      <div className="text-xs text-white/70">Lifetime</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">2.5K</div>
                      <div className="text-xs text-white/70">To Next Tier</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button className="bg-white text-sheraton-navy hover:bg-white/90">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Cash Out
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Redeem
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tier Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-sheraton-gold" />
                    {loyaltyData.currentTier} Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {loyaltyData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2 text-sheraton-navy">
                      Unlock {loyaltyData.nextTier} Benefits
                    </h4>
                    <div className="space-y-1">
                      {loyaltyData.nextTierBenefits
                        .slice(0, 3)
                        .map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-sheraton-gold" />
                            <span className="text-sm text-muted-foreground">
                              {benefit}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* How to Earn Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-sheraton-gold" />
                  How to Earn More Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pointEarningActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="text-center p-4 border rounded-lg"
                    >
                      <activity.icon className="h-8 w-8 mx-auto mb-2 text-sheraton-gold" />
                      <h3 className="font-medium mb-1">{activity.activity}</h3>
                      <p className="text-sm text-muted-foreground">
                        {activity.points}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  onClick={() =>
                    isEditing ? handleSaveProfile() : setIsEditing(true)
                  }
                  className={isEditing ? "sheraton-gradient text-white" : ""}
                >
                  {isEditing ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={userData.firstName}
                      onChange={(e) => {
                        setUserData({ ...userData, firstName: e.target.value });
                        saveFieldToDatabase("firstName", e.target.value);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={userData.lastName}
                      onChange={(e) => {
                        setUserData({ ...userData, lastName: e.target.value });
                        saveFieldToDatabase("lastName", e.target.value);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={(e) => {
                        setUserData({ ...userData, email: e.target.value });
                        saveFieldToDatabase("email", e.target.value);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={userData.phone}
                      onChange={(e) => {
                        setUserData({ ...userData, phone: e.target.value });
                        saveFieldToDatabase("phone", e.target.value);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthday">Birthday</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={userData.birthday}
                      onChange={(e) => {
                        setUserData({ ...userData, birthday: e.target.value });
                        saveFieldToDatabase("birthday", e.target.value);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={userData.location}
                      onChange={(e) => {
                        setUserData({ ...userData, location: e.target.value });
                        saveFieldToDatabase("location", e.target.value);
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-sheraton-gold" />
                  Transaction History & E-Receipts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            transaction.type === "earning"
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {transaction.type === "earning" ? (
                            <TrendingUp className="h-6 w-6" />
                          ) : (
                            <Gift className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {transaction.description}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.date), "MMM dd, yyyy")}{" "}
                            • {transaction.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`font-semibold ${
                            transaction.type === "earning"
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        >
                          {transaction.amount}
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-sheraton-gold" />
                  Your Special Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Room Preferences</h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Preferred Room Type</Label>
                        <Select value={userData.preferences.roomType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">
                              Standard Room
                            </SelectItem>
                            <SelectItem value="deluxe">Deluxe Suite</SelectItem>
                            <SelectItem value="presidential">
                              Presidential Suite
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Bed Type</Label>
                        <Select value={userData.preferences.bedType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="king">King Bed</SelectItem>
                            <SelectItem value="queen">Queen Bed</SelectItem>
                            <SelectItem value="twin">Twin Beds</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Floor Preference</Label>
                        <Select value={userData.preferences.floor}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High Floor</SelectItem>
                            <SelectItem value="low">Low Floor</SelectItem>
                            <SelectItem value="any">No Preference</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="offers">Special Offers</Label>
                        <Switch
                          id="offers"
                          checked={userData.preferences.notifications.offers}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="events">Event Invitations</Label>
                        <Switch
                          id="events"
                          checked={userData.preferences.notifications.events}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="birthday">Birthday Reminders</Label>
                        <Switch
                          id="birthday"
                          checked={userData.preferences.notifications.birthday}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="newsletter">Newsletter</Label>
                        <Switch
                          id="newsletter"
                          checked={
                            userData.preferences.notifications.newsletter
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-sheraton-gold" />
                  Refer Friends & Earn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-sheraton-gold/10 rounded-lg">
                  <Gift className="h-12 w-12 mx-auto mb-4 text-sheraton-gold" />
                  <h3 className="text-xl font-bold mb-2">Earn 1,000 Points</h3>
                  <p className="text-muted-foreground mb-4">
                    For each friend who joins and makes their first booking
                  </p>
                  <div className="flex items-center justify-center gap-2 p-3 bg-white rounded-lg border">
                    <code className="font-mono text-lg">
                      {generateReferralCode()}
                    </code>
                    <Button size="sm" onClick={copyReferralCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button className="mt-4 sheraton-gradient text-white">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Invitation
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-sheraton-gold">
                      5
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Friends Referred
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-sheraton-gold">
                      3
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Successful Bookings
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-sheraton-gold">
                      3,000
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Points Earned
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePageDisabled;
