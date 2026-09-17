import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  CreditCard,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Receipt,
  CheckCircle,
  AlertCircle,
  Crown,
  Gift,
  Star,
  Hotel,
  Car,
  Building,
  Wallet,
  Shield,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Users,
  Bed,
  Eye,
  EyeOff,
  Copy,
  Bell,
  QrCode,
  Plane,
  Utensils,
  Bath,
  Calendar as CalendarIcon,
} from "lucide-react";

interface RoomData {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  size: string;
  guests: string;
  features: string[];
  description: string;
}

interface BookingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomData: RoomData | null;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: string;
  preferences: string[];
  specialRequests: string;
  totalNights: number;
  totalPrice: number;
  savings: number;
}

const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  isOpen,
  onClose,
  roomData,
  checkIn,
  checkOut,
  guests,
  preferences,
  specialRequests,
  totalNights,
  totalPrice,
  savings,
}) => {
  const [step, setStep] = useState<
    "details" | "add-ons" | "payment" | "confirmation"
  >("details");
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    idType: "",
    idNumber: "",
    dateOfBirth: "",
    nationality: "",
    company: "",
    purpose: "leisure",
  });
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "pay-at-hotel" | "bank-transfer"
  >("card");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(2150);
  const [usePoints, setUsePoints] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [earlyCheckIn, setEarlyCheckIn] = useState(false);
  const [lateCheckOut, setLateCheckOut] = useState(false);
  const [newsletter, setNewsletter] = useState(true);

  const addOnServices = [
    {
      id: "airport-transfer",
      name: "Airport Transfer",
      description: "Luxury car pickup/drop-off service",
      price: 75,
      icon: Plane,
      popular: true,
    },
    {
      id: "spa-package",
      name: "Welcome Spa Package",
      description: "60-min massage + spa access",
      price: 120,
      icon: Bath,
      popular: true,
    },
    {
      id: "dining-credit",
      name: "Dining Credit",
      description: "$100 credit for hotel restaurants",
      price: 85,
      icon: Utensils,
      popular: false,
    },
    {
      id: "room-upgrade",
      name: "Guaranteed Room Upgrade",
      description: "Upgrade to next tier room type",
      price: 150,
      icon: Crown,
      popular: false,
    },
    {
      id: "late-checkout",
      name: "Late Checkout (4 PM)",
      description: "Extended checkout until 4:00 PM",
      price: 50,
      icon: Clock,
      popular: false,
    },
    {
      id: "champagne-package",
      name: "Champagne & Roses",
      description: "Premium champagne with rose petals",
      price: 95,
      icon: Gift,
      popular: false,
    },
  ];

  const getTaxesAndFees = () => {
    return Math.round(totalPrice * 0.15);
  };

  const getAddOnsTotal = () => {
    return selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOnServices.find(service => service.id === addOnId);
      return total + (addOn ? addOn.price : 0);
    }, 0);
  };

  const getPointsDiscount = () => {
    if (!usePoints) return 0;
    const maxDiscount = Math.min(loyaltyPoints / 100, totalPrice * 0.15); // 1 point = $0.01, max 15% discount
    return maxDiscount;
  };

  const getFinalTotal = () => {
    return totalPrice + getTaxesAndFees() + getAddOnsTotal() - getPointsDiscount();
  };

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const handleBookingSubmit = async () => {
    setIsProcessing(true);
    
    // Simulate booking processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const confirmationNum = `SH${Date.now().toString().slice(-8)}`;
    setConfirmationNumber(confirmationNum);
    setBookingConfirmed(true);
    setIsProcessing(false);
    setStep("confirmation");
  };

  const resetModal = () => {
    setStep("details");
    setBookingConfirmed(false);
    setIsProcessing(false);
    setGuestInfo({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      idType: "",
      idNumber: "",
      dateOfBirth: "",
      nationality: "",
      company: "",
      purpose: "leisure",
    });
    setSelectedAddOns([]);
    setPaymentDetails({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardName: "",
    });
    setUsePoints(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Guest Information</h3>
        <Badge className="bg-sheraton-gold text-sheraton-navy">
          Primary Guest
        </Badge>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">First Name *</label>
          <Input
            value={guestInfo.firstName}
            onChange={(e) =>
              setGuestInfo(prev => ({ ...prev, firstName: e.target.value }))
            }
            placeholder="Enter first name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Last Name *</label>
          <Input
            value={guestInfo.lastName}
            onChange={(e) =>
              setGuestInfo(prev => ({ ...prev, lastName: e.target.value }))
            }
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email Address *</label>
          <Input
            type="email"
            value={guestInfo.email}
            onChange={(e) =>
              setGuestInfo(prev => ({ ...prev, email: e.target.value }))
            }
            placeholder="Enter email address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Phone Number *</label>
          <Input
            type="tel"
            value={guestInfo.phone}
            onChange={(e) =>
              setGuestInfo(prev => ({ ...prev, phone: e.target.value }))
            }
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Date of Birth</label>
        <Input
          type="date"
          value={guestInfo.dateOfBirth}
          onChange={(e) =>
            setGuestInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))
          }
        />
      </div>

      {/* Address Information */}
      <div className="border-t pt-6">
        <h4 className="text-md font-semibold text-sheraton-navy mb-4">
          Address Information
        </h4>
        <div className="space-y-4">
          <Input
            placeholder="Street Address"
            value={guestInfo.address}
            onChange={(e) =>
              setGuestInfo(prev => ({ ...prev, address: e.target.value }))
            }
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="City"
              value={guestInfo.city}
              onChange={(e) =>
                setGuestInfo(prev => ({ ...prev, city: e.target.value }))
              }
            />
            <Input
              placeholder="State/Province"
              value={guestInfo.state}
              onChange={(e) =>
                setGuestInfo(prev => ({ ...prev, state: e.target.value }))
              }
            />
            <Input
              placeholder="ZIP/Postal Code"
              value={guestInfo.zipCode}
              onChange={(e) =>
                setGuestInfo(prev => ({ ...prev, zipCode: e.target.value }))
              }
            />
          </div>
          <Input
            placeholder="Country"
            value={guestInfo.country}
            onChange={(e) =>
              setGuestInfo(prev => ({ ...prev, country: e.target.value }))
            }
          />
        </div>
      </div>

      {/* ID and Travel Information */}
      <div className="border-t pt-6">
        <h4 className="text-md font-semibold text-sheraton-navy mb-4">
          Identification & Travel Details
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">ID Type</label>
            <Select value={guestInfo.idType} onValueChange={(value) =>
              setGuestInfo(prev => ({ ...prev, idType: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="drivers-license">Driver's License</SelectItem>
                <SelectItem value="national-id">National ID</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ID Number</label>
            <Input
              value={guestInfo.idNumber}
              onChange={(e) =>
                setGuestInfo(prev => ({ ...prev, idNumber: e.target.value }))
              }
              placeholder="Enter ID number"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nationality</label>
            <Input
              value={guestInfo.nationality}
              onChange={(e) =>
                setGuestInfo(prev => ({ ...prev, nationality: e.target.value }))
              }
              placeholder="Enter nationality"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Purpose of Visit</label>
            <Select value={guestInfo.purpose} onValueChange={(value) =>
              setGuestInfo(prev => ({ ...prev, purpose: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leisure">Leisure</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="wedding">Wedding</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {guestInfo.purpose === "business" && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <Input
              value={guestInfo.company}
              onChange={(e) =>
                setGuestInfo(prev => ({ ...prev, company: e.target.value }))
              }
              placeholder="Enter company name"
            />
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-sheraton-navy mb-3">Communication Preferences</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Newsletter & Offers</span>
              <p className="text-sm text-gray-600">Receive exclusive deals and updates</p>
            </div>
            <Switch
              checked={newsletter}
              onCheckedChange={setNewsletter}
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={handleClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={() => setStep("add-ons")}
          className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
          disabled={
            !guestInfo.firstName ||
            !guestInfo.lastName ||
            !guestInfo.email ||
            !guestInfo.phone
          }
        >
          Continue to Add-ons
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderAddOnsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-sheraton-navy mb-2">
          Enhance Your Stay
        </h3>
        <p className="text-gray-600">
          Add special services and amenities to make your experience unforgettable
        </p>
      </div>

      <div className="grid gap-4">
        {addOnServices.map((service) => (
          <div
            key={service.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedAddOns.includes(service.id)
                ? "border-sheraton-gold bg-sheraton-gold/5"
                : "border-gray-200"
            }`}
            onClick={() => handleAddOnToggle(service.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-sheraton-cream rounded-lg">
                  <service.icon className="h-5 w-5 text-sheraton-navy" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-sheraton-navy">
                      {service.name}
                    </h4>
                    {service.popular && (
                      <Badge className="bg-sheraton-gold text-sheraton-navy text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sheraton-navy">
                  ${service.price}
                </div>
                <div className="text-xs text-gray-500">per stay</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Special Options */}
      <div className="bg-sheraton-cream rounded-lg p-4">
        <h4 className="font-medium text-sheraton-navy mb-3">Convenience Options</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Early Check-in (12 PM)</span>
              <p className="text-sm text-gray-600">Subject to availability</p>
            </div>
            <Switch
              checked={earlyCheckIn}
              onCheckedChange={setEarlyCheckIn}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Late Check-out (2 PM)</span>
              <p className="text-sm text-gray-600">Complimentary for special guests</p>
            </div>
            <Switch
              checked={lateCheckOut}
              onCheckedChange={setLateCheckOut}
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={() => setStep("details")}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setStep("payment")}
          className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
        >
          Continue to Payment
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Payment & Final Details</h3>

      {/* Loyalty Points */}
      <div className="bg-sheraton-cream rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-sheraton-gold" />
            <span className="font-medium">Loyalty Points</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Use points</span>
            <Switch checked={usePoints} onCheckedChange={setUsePoints} />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Available: {loyaltyPoints.toLocaleString()} points</span>
          {usePoints && (
            <span className="text-green-600 font-medium">
              -${getPointsDiscount().toFixed(2)}
            </span>
          )}
        </div>
        {usePoints && (
          <p className="text-xs text-gray-600 mt-1">
            Using {Math.floor(getPointsDiscount() * 100)} points for discount
          </p>
        )}
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Payment Method</label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={paymentMethod === "card" ? "default" : "outline"}
            onClick={() => setPaymentMethod("card")}
            className={
              paymentMethod === "card"
                ? "bg-sheraton-gold text-sheraton-navy"
                : ""
            }
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Card
          </Button>
          <Button
            variant={paymentMethod === "pay-at-hotel" ? "default" : "outline"}
            onClick={() => setPaymentMethod("pay-at-hotel")}
            className={
              paymentMethod === "pay-at-hotel"
                ? "bg-sheraton-gold text-sheraton-navy"
                : ""
            }
          >
            <Building className="h-4 w-4 mr-2" />
            Pay at Hotel
          </Button>
          <Button
            variant={paymentMethod === "bank-transfer" ? "default" : "outline"}
            onClick={() => setPaymentMethod("bank-transfer")}
            className={
              paymentMethod === "bank-transfer"
                ? "bg-sheraton-gold text-sheraton-navy"
                : ""
            }
          >
            <Wallet className="h-4 w-4 mr-2" />
            Bank Transfer
          </Button>
        </div>
      </div>

      {/* Payment Details */}
      {paymentMethod === "card" && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Cardholder Name</label>
            <Input
              value={paymentDetails.cardName}
              onChange={(e) =>
                setPaymentDetails(prev => ({ ...prev, cardName: e.target.value }))
              }
              placeholder="Name on card"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Card Number</label>
            <Input
              value={paymentDetails.cardNumber}
              onChange={(e) =>
                setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))
              }
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date</label>
              <Input
                value={paymentDetails.expiryDate}
                onChange={(e) =>
                  setPaymentDetails(prev => ({ ...prev, expiryDate: e.target.value }))
                }
                placeholder="MM/YY"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CVV</label>
              <Input
                value={paymentDetails.cvv}
                onChange={(e) =>
                  setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))
                }
                placeholder="123"
                maxLength={3}
              />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === "pay-at-hotel" && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">Pay at Hotel</span>
          </div>
          <p className="text-sm text-blue-700">
            Complete payment during check-in. We'll hold your reservation with no charge.
          </p>
        </div>
      )}

      {paymentMethod === "bank-transfer" && (
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Wallet className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-900">Bank Transfer</span>
          </div>
          <p className="text-sm text-green-700">
            Transfer details will be provided after booking confirmation.
          </p>
        </div>
      )}

      {/* Booking Summary */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-medium mb-3">Booking Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Room rate ({totalNights} nights)</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Special discount</span>
              <span>-${savings.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Taxes & fees</span>
            <span>${getTaxesAndFees().toFixed(2)}</span>
          </div>
          {getAddOnsTotal() > 0 && (
            <div className="flex justify-between">
              <span>Add-on services</span>
              <span>${getAddOnsTotal().toFixed(2)}</span>
            </div>
          )}
          {usePoints && getPointsDiscount() > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Points discount</span>
              <span>-${getPointsDiscount().toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${getFinalTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={() => setStep("add-ons")}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleBookingSubmit}
          disabled={isProcessing}
          className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
        >
          {isProcessing ? (
            "Processing..."
          ) : (
            <>
              Confirm Booking ${getFinalTotal().toFixed(2)}
              <Receipt className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-sheraton-navy mb-2">
          Booking Confirmed!
        </h3>
        <p className="text-gray-600">
          Welcome to Sheraton Special! Your reservation is confirmed and we can't wait to host you.
        </p>
      </div>

      <div className="bg-sheraton-cream rounded-lg p-6">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-600">Confirmation Number</div>
          <div className="text-2xl font-bold text-sheraton-navy mb-2">
            {confirmationNumber}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(confirmationNumber)}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
        </div>
        
        {roomData && checkIn && checkOut && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Room</div>
              <div className="font-medium">{roomData.name}</div>
            </div>
            <div>
              <div className="text-gray-600">Total Paid</div>
              <div className="font-medium">${getFinalTotal().toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600">Check-in</div>
              <div className="font-medium">{checkIn.toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-gray-600">Check-out</div>
              <div className="font-medium">{checkOut.toLocaleDateString()}</div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <Bell className="h-4 w-4" />
          <span>Confirmation email sent to {guestInfo.email}</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <QrCode className="h-4 w-4" />
          <span>Mobile check-in available 24 hours before arrival</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>Digital key access will be activated on check-in day</span>
        </div>
      </div>

      <div className="bg-sheraton-gold/10 border border-sheraton-gold rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Crown className="h-5 w-5 text-sheraton-gold" />
          <span className="font-medium text-sheraton-navy">Special Guest Benefits</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 text-sheraton-gold" />
            <span>+{Math.round(getFinalTotal() / 10)} loyalty points</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-sheraton-gold" />
            <span>Priority check-in</span>
          </div>
          <div className="flex items-center space-x-1">
            <Gift className="h-3 w-3 text-sheraton-gold" />
            <span>Welcome amenities</span>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3 text-sheraton-gold" />
            <span>24/7 guest support</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={handleClose} className="flex-1">
          Book Another Stay
        </Button>
        <Button
          onClick={handleClose}
          className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
        >
          Done
        </Button>
      </div>
    </div>
  );

  if (!isOpen || !roomData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-sheraton-gold" />
            <span>Complete Your Booking</span>
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[
            { id: "details", label: "Details", icon: User },
            { id: "add-ons", label: "Add-ons", icon: Gift },
            { id: "payment", label: "Payment", icon: CreditCard },
            { id: "confirmation", label: "Confirm", icon: CheckCircle },
          ].map((stepItem, index) => {
            const isActive = step === stepItem.id;
            const isCompleted =
              (step === "add-ons" && stepItem.id === "details") ||
              (step === "payment" && ["details", "add-ons"].includes(stepItem.id)) ||
              (step === "confirmation" && ["details", "add-ons", "payment"].includes(stepItem.id));

            return (
              <div key={stepItem.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "bg-sheraton-gold text-sheraton-navy"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <stepItem.icon className="h-4 w-4" />
                </div>
                <span
                  className={`ml-2 text-sm ${
                    isActive ? "font-medium text-sheraton-navy" : "text-gray-500"
                  }`}
                >
                  {stepItem.label}
                </span>
                {index < 3 && (
                  <div
                    className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Booking Summary Header */}
        <div className="bg-sheraton-cream rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{roomData.image}</span>
              <div>
                <h4 className="font-semibold text-sheraton-navy">{roomData.name}</h4>
                <p className="text-sm text-gray-600">
                  {checkIn && checkOut && (
                    `${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()}`
                  )} • {guests} guests • {totalNights} nights
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-sheraton-navy">
                ${getFinalTotal().toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>

        {/* Content */}
        {step === "details" && renderDetailsStep()}
        {step === "add-ons" && renderAddOnsStep()}
        {step === "payment" && renderPaymentStep()}
        {step === "confirmation" && renderConfirmationStep()}
      </DialogContent>
    </Dialog>
  );
};

export default BookingCheckoutModal;
