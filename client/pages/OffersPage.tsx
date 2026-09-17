import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import {
  Crown,
  Clock,
  Calendar,
  Star,
  Gift,
  Percent,
  Users,
  Heart,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Tag,
  TrendingUp,
  Timer,
  Zap,
  CheckCircle,
  AlertCircle,
  Copy,
  Bell,
} from "lucide-react";

const OffersPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const offerCategories = [
    { id: "all", label: "All Offers", icon: Gift },
    { id: "dining", label: "Dining", icon: Users },
    { id: "accommodation", label: "Rooms", icon: Crown },
    { id: "spa", label: "Spa & Wellness", icon: Heart },
    { id: "loyalty", label: "Loyalty Rewards", icon: Star },
    { id: "seasonal", label: "Seasonal", icon: Sparkles },
  ];

  const specialOffers = [
    {
      id: "welcome-special",
      title: "Welcome to Special - 30% Off First Stay",
      description:
        "New guests enjoy exclusive savings on their inaugural experience at Sheraton Special",
      discount: "30% OFF",
      discountType: "percentage",
      category: "accommodation",
      validUntil: "2024-12-31",
      minSpend: 200,
      maxDiscount: 150,
      code: "WELCOME30",
      featured: true,
      terms: [
        "Valid for new guests only",
        "Minimum 2-night stay required",
        "Cannot be combined with other offers",
        "Subject to availability",
      ],
      image: "🏨",
      popularity: 95,
      limitedTime: false,
    },
    {
      id: "flash-dining",
      title: "Flash Sale - 50% Off Fine Dining",
      description:
        "Limited time only! Experience our award-winning restaurant at half price",
      discount: "50% OFF",
      discountType: "percentage",
      category: "dining",
      validUntil: "2024-03-15",
      minSpend: 80,
      maxDiscount: 100,
      code: "FLASH50",
      featured: true,
      terms: [
        "Valid Monday-Thursday only",
        "Dinner service 6pm-9pm",
        "Advance reservation required",
        "Excludes beverages",
      ],
      image: "🍽️",
      popularity: 88,
      limitedTime: true,
      timeLeft: new Date("2024-03-15T23:59:59"),
    },
    {
      id: "spa-package",
      title: "Serenity Spa Package - $100 Value",
      description:
        "Complete relaxation experience with massage, facial, and access to all facilities",
      discount: "$100 VALUE",
      discountType: "fixed",
      category: "spa",
      validUntil: "2024-06-30",
      minSpend: 150,
      maxDiscount: 100,
      code: "SPA100",
      featured: false,
      terms: [
        "Package includes 60-min massage",
        "Express facial treatment",
        "All-day spa facility access",
        "Booking required 24hrs in advance",
      ],
      image: "🧘‍♀️",
      popularity: 92,
      limitedTime: false,
    },
    {
      id: "loyalty-double",
      title: "Double Points Weekend",
      description:
        "Earn 2x loyalty points on all purchases during your stay",
      discount: "2X POINTS",
      discountType: "multiplier",
      category: "loyalty",
      validUntil: "2024-02-25",
      minSpend: 0,
      maxDiscount: 0,
      code: "DOUBLE2X",
      featured: false,
      terms: [
        "Valid Friday-Sunday",
        "Applies to all hotel services",
        "Points credited within 48 hours",
        "Special loyalty tier benefits included",
      ],
      image: "⭐",
      popularity: 78,
      limitedTime: true,
      timeLeft: new Date("2024-02-25T23:59:59"),
    },
    {
      id: "valentine-romance",
      title: "Valentine's Romance Package",
      description:
        "Romantic getaway with champagne, roses, and couples spa treatment",
      discount: "25% OFF",
      discountType: "percentage",
      category: "seasonal",
      validUntil: "2024-02-16",
      minSpend: 300,
      maxDiscount: 200,
      code: "LOVE25",
      featured: true,
      terms: [
        "Valid February 12-16",
        "Includes champagne & roses",
        "Couples spa treatment",
        "Late checkout complimentary",
      ],
      image: "💕",
      popularity: 85,
      limitedTime: true,
      timeLeft: new Date("2024-02-16T23:59:59"),
    },
    {
      id: "business-traveler",
      title: "Business Traveler Special",
      description:
        "Executive perks for business guests including meeting room credits",
      discount: "20% OFF",
      discountType: "percentage",
      category: "accommodation",
      validUntil: "2024-12-31",
      minSpend: 150,
      maxDiscount: 75,
      code: "BIZ20",
      featured: false,
      terms: [
        "Valid Sunday-Thursday",
        "Includes meeting room credits",
        "Executive lounge access",
        "Express checkout available",
      ],
      image: "💼",
      popularity: 72,
      limitedTime: false,
    },
  ];

  const filteredOffers = specialOffers.filter((offer) => {
    if (selectedCategory === "all") return true;
    return offer.category === selectedCategory;
  });

  const getTimeRemaining = (endDate: Date) => {
    const now = currentTime.getTime();
    const end = endDate.getTime();
    const timeLeft = end - now;

    if (timeLeft <= 0) return null;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isOfferValid = (validUntil: string) => {
    return new Date(validUntil) > currentTime;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sheraton-cream via-white to-sheraton-pearl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="h-10 w-10 text-sheraton-gold" />
            <h1 className="text-4xl font-bold text-sheraton-navy">
              Special Offers
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Exclusive deals and packages designed to make your stay even more
            special. Limited time offers for our valued guests.
          </p>
        </div>

        {/* Featured Banner */}
        <Card className="mb-8 bg-gradient-to-r from-sheraton-gold/20 to-sheraton-navy/20 border-sheraton-gold">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="text-6xl">🎉</div>
                <div>
                  <h3 className="text-2xl font-bold text-sheraton-navy mb-2">
                    Limited Time Flash Sale!
                  </h3>
                  <p className="text-gray-700">
                    Up to 50% off dining experiences - Don't miss out!
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Ends in:</div>
                <div className="text-3xl font-bold text-sheraton-gold">
                  {(() => {
                    const timeLeft = getTimeRemaining(
                      new Date("2024-03-15T23:59:59"),
                    );
                    if (!timeLeft) return "EXPIRED";
                    return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {offerCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? "bg-sheraton-gold text-sheraton-navy"
                  : ""
              }`}
            >
              <category.icon className="h-4 w-4" />
              <span>{category.label}</span>
            </Button>
          ))}
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredOffers.map((offer) => {
            const timeLeft = offer.timeLeft ? getTimeRemaining(offer.timeLeft) : null;
            const isValid = isOfferValid(offer.validUntil);

            return (
              <Card
                key={offer.id}
                className={`overflow-hidden hover:shadow-lg transition-shadow ${
                  offer.featured ? "ring-2 ring-sheraton-gold" : ""
                } ${!isValid ? "opacity-60" : ""}`}
              >
                {offer.featured && (
                  <div className="bg-sheraton-gold text-sheraton-navy text-center py-1 text-sm font-medium">
                    ⭐ FEATURED OFFER ⭐
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">{offer.image}</span>
                      <div>
                        <h3 className="font-bold text-sheraton-navy mb-1">
                          {offer.title}
                        </h3>
                        <Badge
                          className={`${
                            offer.discountType === "percentage"
                              ? "bg-red-100 text-red-700"
                              : offer.discountType === "fixed"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {offer.discount}
                        </Badge>
                      </div>
                    </div>
                    {offer.limitedTime && timeLeft && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Ends in:</div>
                        <div className="text-sm font-bold text-red-600">
                          {timeLeft.days}d {timeLeft.hours}h
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {offer.description}
                  </p>

                  {/* Promo Code */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Promo Code:
                        </div>
                        <div className="font-mono font-bold text-sheraton-navy">
                          {offer.code}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyPromoCode(offer.code)}
                        className="flex items-center space-x-1"
                      >
                        {copiedCode === offer.code ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Offer Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valid Until:</span>
                      <span className="font-medium">
                        {new Date(offer.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    {offer.minSpend > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Minimum Spend:</span>
                        <span className="font-medium">${offer.minSpend}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Popularity:</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="font-medium">{offer.popularity}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Terms Preview */}
                  <div className="mb-4">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600 hover:text-sheraton-navy">
                        Terms & Conditions
                      </summary>
                      <ul className="mt-2 space-y-1 text-xs text-gray-500">
                        {offer.terms.map((term, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span>•</span>
                            <span>{term}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {offer.category === "accommodation" && (
                      <Link to="/book" className="flex-1">
                        <Button
                          className="w-full bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
                          disabled={!isValid}
                        >
                          Book Now
                        </Button>
                      </Link>
                    )}
                    {offer.category === "dining" && (
                      <Link to="/menu" className="flex-1">
                        <Button
                          className="w-full bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
                          disabled={!isValid}
                        >
                          View Menu
                        </Button>
                      </Link>
                    )}
                    {offer.category === "spa" && (
                      <Link to="/spa" className="flex-1">
                        <Button
                          className="w-full bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
                          disabled={!isValid}
                        >
                          Book Spa
                        </Button>
                      </Link>
                    )}
                    {(offer.category === "loyalty" ||
                      offer.category === "seasonal") && (
                      <Button
                        className="w-full bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
                        disabled={!isValid}
                      >
                        Learn More
                      </Button>
                    )}
                  </div>

                  {!isValid && (
                    <div className="mt-3 flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>This offer has expired</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-sheraton-navy text-white">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Bell className="h-6 w-6 text-sheraton-gold" />
              <h3 className="text-2xl font-bold">Never Miss a Special Offer</h3>
            </div>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Subscribe to our exclusive offers newsletter and be the first to
              know about flash sales, seasonal packages, and member-only deals.
            </p>
            <div className="flex flex-col md:flex-row max-w-md mx-auto space-y-3 md:space-y-0 md:space-x-3">
              <Input
                placeholder="Enter your email"
                className="bg-white text-gray-900 flex-1"
              />
              <Button className="bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-white/60 mt-3">
              Unsubscribe anytime. We respect your privacy.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Phone className="h-8 w-8 text-sheraton-gold mx-auto mb-3" />
              <h4 className="font-semibold text-sheraton-navy mb-2">
                Call for Exclusive Deals
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Speak with our reservations team for personalized offers
              </p>
              <p className="font-mono text-sheraton-navy">+1 (555) SPECIAL</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="h-8 w-8 text-sheraton-gold mx-auto mb-3" />
              <h4 className="font-semibold text-sheraton-navy mb-2">
                Email Updates
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Get weekly offers delivered to your inbox
              </p>
              <p className="font-mono text-sheraton-navy">
                offers@sheraton-special.com
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Crown className="h-8 w-8 text-sheraton-gold mx-auto mb-3" />
              <h4 className="font-semibold text-sheraton-navy mb-2">
                Loyalty Benefits
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Members get access to exclusive hidden deals
              </p>
              <Link to="/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-sheraton-gold text-sheraton-navy"
                >
                  Join Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
