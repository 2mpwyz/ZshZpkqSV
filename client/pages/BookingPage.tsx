import { useState } from "react";
import { Link } from "react-router-dom";
import BookingCheckoutModal from "../components/booking/BookingCheckoutModal";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Checkbox } from "../components/ui/checkbox";
import { Separator } from "../components/ui/separator";
import {
  Crown,
  Hotel,
  Calendar as CalendarIcon,
  Users,
  Bed,
  Wifi,
  Coffee,
  Car,
  Utensils,
  Bath,
  Wind,
  Tv,
  Star,
  Heart,
  Gift,
  QrCode,
  CreditCard,
  CheckCircle,
  MapPin,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";

const BookingPage = () => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [guests, setGuests] = useState("2");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [showBookingCheckout, setShowBookingCheckout] = useState(false);

  const roomTypes = [
    {
      id: "deluxe",
      name: "Deluxe Suite",
      price: 299,
      originalPrice: 399,
      image: "🏨",
      size: "45 m²",
      guests: "2-3",
      features: ["King Bed", "City View", "Mini Bar", "Work Desk"],
      amenities: [Wifi, Coffee, Tv, Wind],
      badge: "Popular",
      description:
        "Elegant suite with modern amenities and stunning city views",
    },
    {
      id: "presidential",
      name: "Presidential Suite",
      price: 599,
      originalPrice: 799,
      image: "👑",
      size: "80 m²",
      guests: "2-4",
      features: ["Master Bedroom", "Living Room", "Balcony", "Butler Service"],
      amenities: [Wifi, Coffee, Tv, Wind, Bath, Car],
      badge: "Luxury",
      description:
        "Ultimate luxury with personalized service and premium amenities",
    },
    {
      id: "garden",
      name: "Garden Villa",
      price: 449,
      originalPrice: 599,
      image: "🌿",
      size: "60 m²",
      guests: "2-4",
      features: ["Private Garden", "Outdoor Bath", "Fireplace", "Terrace"],
      amenities: [Wifi, Coffee, Tv, Wind, Bath],
      badge: "Nature",
      description:
        "Tranquil villa surrounded by lush gardens and natural beauty",
    },
  ];

  const roomPreferences = [
    { id: "high-floor", label: "High Floor" },
    { id: "quiet-room", label: "Quiet Room" },
    { id: "connecting-rooms", label: "Connecting Rooms" },
    { id: "near-elevator", label: "Near Elevator" },
    { id: "balcony", label: "Balcony" },
    { id: "king-bed", label: "King Bed" },
    { id: "twin-beds", label: "Twin Beds" },
    { id: "smoking", label: "Smoking Room" },
  ];

  const handlePreferenceChange = (prefId: string, checked: boolean) => {
    if (checked) {
      setPreferences([...preferences, prefId]);
    } else {
      setPreferences(preferences.filter((p) => p !== prefId));
    }
  };

  const selectedRoomData = roomTypes.find((room) => room.id === selectedRoom);
  const totalNights =
    checkIn && checkOut
      ? Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;
  const totalPrice = selectedRoomData
    ? selectedRoomData.price * totalNights
    : 0;
  const savings = selectedRoomData
    ? (selectedRoomData.originalPrice - selectedRoomData.price) * totalNights
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sheraton-cream to-background">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-sheraton-gold mr-2" />
            <Badge className="bg-sheraton-gold text-sheraton-navy px-4 py-2">
              Special Guest Booking
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-sheraton-navy mb-4">
            Book Your Special Stay
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience luxury, comfort, and personalized service. Every detail
            crafted to make your stay extraordinary.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Dates and Guests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-sheraton-gold" />
                  When would you like to stay?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Check-in Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkIn && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkIn ? format(checkIn, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkIn}
                          onSelect={setCheckIn}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Check-out Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkOut && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOut ? format(checkOut, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkOut}
                          onSelect={setCheckOut}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Guests</Label>
                    <Select value={guests} onValueChange={setGuests}>
                      <SelectTrigger>
                        <SelectValue placeholder="Number of guests" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Guest</SelectItem>
                        <SelectItem value="2">2 Guests</SelectItem>
                        <SelectItem value="3">3 Guests</SelectItem>
                        <SelectItem value="4">4 Guests</SelectItem>
                        <SelectItem value="5">5+ Guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-sheraton-gold" />
                  Choose Your Perfect Room
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {roomTypes.map((room) => (
                  <div
                    key={room.id}
                    className={cn(
                      "border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg",
                      selectedRoom === room.id
                        ? "border-sheraton-gold bg-sheraton-gold/5"
                        : "border-border",
                    )}
                    onClick={() => setSelectedRoom(room.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{room.image}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold text-sheraton-navy">
                              {room.name}
                            </h3>
                            <Badge variant="secondary">{room.badge}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-2">
                            {room.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              {room.size}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {room.guests} guests
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground line-through">
                            ${room.originalPrice}
                          </span>
                          <span className="text-2xl font-bold text-sheraton-navy">
                            ${room.price}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          per night
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {room.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {room.amenities.map((Amenity, index) => (
                        <Amenity
                          key={index}
                          className="h-4 w-4 text-sheraton-gold"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Room Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-sheraton-gold" />
                  Your Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {roomPreferences.map((pref) => (
                    <div key={pref.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={pref.id}
                        checked={preferences.includes(pref.id)}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(pref.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={pref.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {pref.label}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Special Requests</Label>
                  <Textarea
                    placeholder="Let us know how we can make your stay extra special..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-sheraton-gold" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRoomData && (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-sheraton-gold/10 rounded-lg">
                      <div className="text-2xl">{selectedRoomData.image}</div>
                      <div>
                        <h4 className="font-semibold text-sheraton-navy">
                          {selectedRoomData.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedRoomData.size} • {selectedRoomData.guests}{" "}
                          guests
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      {checkIn && checkOut && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Check-in</span>
                            <span>{format(checkIn, "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Check-out</span>
                            <span>{format(checkOut, "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Duration</span>
                            <span>{totalNights} nights</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>Guests</span>
                        <span>{guests}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Room rate ({totalNights} nights)</span>
                        <span>
                          ${selectedRoomData.originalPrice * totalNights}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Special discount</span>
                        <span>-${savings}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxes & fees</span>
                        <span>${Math.round(totalPrice * 0.15)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-sheraton-navy">
                          ${totalPrice + Math.round(totalPrice * 0.15)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-green-600">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Free cancellation until 24h before</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>
                          Loyalty points: +{Math.round(totalPrice / 10)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Special guest priority access</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-3">
                  <Button
                    className="w-full sheraton-gradient text-white"
                    size="lg"
                    disabled={!selectedRoom || !checkIn || !checkOut}
                    onClick={() => setShowBookingCheckout(true)}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <QrCode className="mr-2 h-4 w-4" />
                      QR Check-in
                    </Button>
                    <Button variant="outline" size="sm">
                      <MapPin className="mr-2 h-4 w-4" />
                      Virtual Tour
                    </Button>
                  </div>
                </div>

                <div className="text-center text-xs text-muted-foreground">
                  <p>🔒 Secure booking • Best rate guarantee</p>
                  <Link
                    to="/profile"
                    className="text-sheraton-gold hover:underline"
                  >
                    Sign in for exclusive member rates
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Special Offers */}
            <Card className="border-sheraton-gold">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sheraton-gold">
                  <Star className="h-5 w-5" />
                  Special Offers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-sheraton-gold/10 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Welcome Bonus</h4>
                  <p className="text-xs text-muted-foreground">
                    First-time guests get complimentary spa access
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">Extended Stay</h4>
                  <p className="text-xs text-muted-foreground">
                    Stay 3+ nights and save 15% extra
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Checkout Modal */}
        <BookingCheckoutModal
          isOpen={showBookingCheckout}
          onClose={() => setShowBookingCheckout(false)}
          roomData={selectedRoomData}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          preferences={preferences}
          specialRequests={specialRequests}
          totalNights={totalNights}
          totalPrice={totalPrice}
          savings={savings}
        />
      </div>
    </div>
  );
};

export default BookingPage;
