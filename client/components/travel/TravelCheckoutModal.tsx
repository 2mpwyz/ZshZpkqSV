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
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Receipt,
  CheckCircle,
  AlertCircle,
  Crown,
  Gift,
  Star,
  Users,
  Camera,
  Wallet,
  Shield,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  X,
  Plane,
  Mountain,
  Coffee,
  Download,
  FileText,
  Globe,
  Heart,
} from "lucide-react";

interface Experience {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  originalPrice: number;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  included: string[];
  highlights: string[];
  availability: string;
  meetingPoint: string;
  cancellation: string;
  difficulty: string;
  ageRestriction: string;
  whatToBring: string[];
  partnerId: string;
}

interface TravelCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { [key: string]: number };
  experiences: Experience[];
  onUpdateCart: (experienceId: string, quantity: number) => void;
  onRemoveFromCart: (experienceId: string) => void;
  onClearCart: () => void;
}

const TravelCheckoutModal: React.FC<TravelCheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  experiences,
  onUpdateCart,
  onRemoveFromCart,
  onClearCart,
}) => {
  const [step, setStep] = useState<
    "experiences" | "travelers" | "payment" | "confirmation"
  >("experiences");
  const [travelersInfo, setTravelersInfo] = useState({
    leadTraveler: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      nationality: "",
      passportNumber: "",
      emergencyContact: "",
      emergencyPhone: "",
    },
    additionalTravelers: [] as any[],
  });
  const [selectedDate, setSelectedDate] = useState<{[key: string]: string}>({});
  const [preferences, setPreferences] = useState({
    pickup: true,
    insurance: false,
    photoPackage: false,
    specialDietary: "",
    accessibilityNeeds: "",
    specialRequests: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "room-charge" | "paypal" | "installments"
  >("card");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState(3250);
  const [usePoints, setUsePoints] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [bookingReference, setBookingReference] = useState("");

  const cartItems = Object.entries(cart).map(([experienceId, quantity]) => {
    const experience = experiences.find((e) => e.id === experienceId);
    return experience ? { ...experience, quantity } : null;
  }).filter(Boolean);

  const subtotal = cartItems.reduce(
    (total, item) => total + (item?.price || 0) * (item?.quantity || 0),
    0
  );

  const addOns = {
    insurance: preferences.insurance ? subtotal * 0.08 : 0,
    photoPackage: preferences.photoPackage ? 75 : 0,
  };
  const addOnTotal = Object.values(addOns).reduce((sum, cost) => sum + cost, 0);
  const tax = (subtotal + addOnTotal) * 0.08;
  const pointsDiscount = usePoints ? Math.min(loyaltyPoints * 0.01, subtotal * 0.2) : 0;
  const total = subtotal + addOnTotal + tax - pointsDiscount;

  const getStepProgress = () => {
    const steps = ["experiences", "travelers", "payment", "confirmation"];
    return ((steps.indexOf(step) + 1) / steps.length) * 100;
  };

  const validateStep = () => {
    switch (step) {
      case "experiences":
        return cartItems.length > 0;
      case "travelers":
        return (
          travelersInfo.leadTraveler.firstName &&
          travelersInfo.leadTraveler.lastName &&
          travelersInfo.leadTraveler.email &&
          travelersInfo.leadTraveler.phone
        );
      case "payment":
        if (paymentMethod === "card") {
          return (
            paymentDetails.cardNumber &&
            paymentDetails.expiryDate &&
            paymentDetails.cvv &&
            paymentDetails.cardName
          );
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    
    const steps = ["experiences", "travelers", "payment", "confirmation"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1] as any);
    }
  };

  const handleBack = () => {
    const steps = ["experiences", "travelers", "payment", "confirmation"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1] as any);
    }
  };

  const handleBookExperiences = async () => {
    setIsProcessing(true);
    
    // Simulate booking processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const bookingRef = `TRV${Date.now().toString().slice(-6)}`;
    setBookingReference(bookingRef);
    setOrderConfirmed(true);
    setIsProcessing(false);
    onClearCart();
  };

  const resetModal = () => {
    setStep("experiences");
    setOrderConfirmed(false);
    setIsProcessing(false);
    setTravelersInfo({
      leadTraveler: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        nationality: "",
        passportNumber: "",
        emergencyContact: "",
        emergencyPhone: "",
      },
      additionalTravelers: [],
    });
    setPaymentDetails({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardName: "",
    });
    setUsePoints(false);
    setSelectedDate({});
    setPreferences({
      pickup: true,
      insurance: false,
      photoPackage: false,
      specialDietary: "",
      accessibilityNeeds: "",
      specialRequests: "",
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (orderConfirmed) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md mx-auto">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-sheraton-navy mb-2">Experiences Booked!</h2>
            <p className="text-gray-600 mb-6">
              Your travel experiences have been confirmed successfully.
            </p>
            
            <div className="bg-sheraton-cream rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Booking Reference</span>
                <span className="font-semibold text-sheraton-navy">{bookingReference}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="font-semibold text-sheraton-navy">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Experiences</span>
                <span className="font-semibold text-sheraton-navy">{cartItems.length}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleClose} 
                className="w-full bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
              >
                <Camera className="h-4 w-4 mr-2" />
                View My Bookings
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Vouchers
              </Button>
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-sheraton-navy">
            {step === "experiences" && "Your Experiences"}
            {step === "travelers" && "Traveler Information"}
            {step === "payment" && "Payment & Preferences"}
            {step === "confirmation" && "Booking Confirmation"}
          </DialogTitle>
          <div className="mt-4">
            <Progress value={getStepProgress()} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span className={step === "experiences" ? "text-sheraton-navy font-medium" : ""}>Experiences</span>
              <span className={step === "travelers" ? "text-sheraton-navy font-medium" : ""}>Travelers</span>
              <span className={step === "payment" ? "text-sheraton-navy font-medium" : ""}>Payment</span>
              <span className={step === "confirmation" ? "text-sheraton-navy font-medium" : ""}>Confirm</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "experiences" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-sheraton-navy">Selected Experiences</h3>
                  <Badge variant="secondary">{cartItems.length} experiences</Badge>
                </div>
                
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No experiences selected</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item?.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-sheraton-cream to-sheraton-pearl rounded-lg flex items-center justify-center text-2xl">
                            {item?.image}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-sheraton-navy text-lg">{item?.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">{item?.description}</p>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {item?.duration}
                                  </div>
                                  <div className="flex items-center">
                                    <Star className="h-3 w-3 mr-1" />
                                    {item?.rating} ({item?.reviews} reviews)
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {item?.meetingPoint}
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {item?.availability}
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <p className="text-sm font-medium text-gray-700 mb-1">Highlights:</p>
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {item?.highlights.slice(0, 3).map((highlight, idx) => (
                                      <li key={idx} className="flex items-center">
                                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                        {highlight}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveFromCart(item?.id || "")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Experience Date
                                </label>
                                <Input
                                  type="date"
                                  value={selectedDate[item?.id || ""] || ""}
                                  onChange={(e) => setSelectedDate({...selectedDate, [item?.id || ""]: e.target.value})}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Participants
                                </label>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onUpdateCart(item?.id || "", Math.max(1, (item?.quantity || 1) - 1))}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="px-3 py-1 bg-gray-100 rounded text-sm">
                                    {item?.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onUpdateCart(item?.id || "", (item?.quantity || 0) + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">Total Price</p>
                                <div className="flex items-center justify-end space-x-2">
                                  <span className="text-sm text-gray-500 line-through">
                                    ${((item?.originalPrice || 0) * (item?.quantity || 0)).toFixed(2)}
                                  </span>
                                  <span className="text-lg font-semibold text-sheraton-navy">
                                    ${((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === "travelers" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Lead Traveler Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <Input
                        value={travelersInfo.leadTraveler.firstName}
                        onChange={(e) => setTravelersInfo({
                          ...travelersInfo,
                          leadTraveler: {...travelersInfo.leadTraveler, firstName: e.target.value}
                        })}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <Input
                        value={travelersInfo.leadTraveler.lastName}
                        onChange={(e) => setTravelersInfo({
                          ...travelersInfo,
                          leadTraveler: {...travelersInfo.leadTraveler, lastName: e.target.value}
                        })}
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={travelersInfo.leadTraveler.email}
                        onChange={(e) => setTravelersInfo({
                          ...travelersInfo,
                          leadTraveler: {...travelersInfo.leadTraveler, email: e.target.value}
                        })}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <Input
                        value={travelersInfo.leadTraveler.phone}
                        onChange={(e) => setTravelersInfo({
                          ...travelersInfo,
                          leadTraveler: {...travelersInfo.leadTraveler, phone: e.target.value}
                        })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <Input
                        type="date"
                        value={travelersInfo.leadTraveler.dateOfBirth}
                        onChange={(e) => setTravelersInfo({
                          ...travelersInfo,
                          leadTraveler: {...travelersInfo.leadTraveler, dateOfBirth: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality
                      </label>
                      <Input
                        value={travelersInfo.leadTraveler.nationality}
                        onChange={(e) => setTravelersInfo({
                          ...travelersInfo,
                          leadTraveler: {...travelersInfo.leadTraveler, nationality: e.target.value}
                        })}
                        placeholder="American"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact Name
                      </label>
                      <Input
                        value={travelersInfo.leadTraveler.emergencyContact}
                        onChange={(e) => setTravelersInfo({
                          ...travelersInfo,
                          leadTraveler: {...travelersInfo.leadTraveler, emergencyContact: e.target.value}
                        })}
                        placeholder="Contact Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact Phone
                      </label>
                      <Input
                        value={travelersInfo.leadTraveler.emergencyPhone}
                        onChange={(e) => setTravelersInfo({
                          ...travelersInfo,
                          leadTraveler: {...travelersInfo.leadTraveler, emergencyPhone: e.target.value}
                        })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Special Requirements</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dietary Requirements
                      </label>
                      <Input
                        value={preferences.specialDietary}
                        onChange={(e) => setPreferences({...preferences, specialDietary: e.target.value})}
                        placeholder="Vegetarian, Gluten-free, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accessibility Needs
                      </label>
                      <Input
                        value={preferences.accessibilityNeeds}
                        onChange={(e) => setPreferences({...preferences, accessibilityNeeds: e.target.value})}
                        placeholder="Wheelchair access, mobility assistance, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requests
                      </label>
                      <Textarea
                        value={preferences.specialRequests}
                        onChange={(e) => setPreferences({...preferences, specialRequests: e.target.value})}
                        placeholder="Any other special requests or requirements..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === "payment" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { id: "card", name: "Credit/Debit Card", icon: CreditCard },
                      { id: "room-charge", name: "Room Charge", icon: Crown },
                      { id: "paypal", name: "PayPal", icon: Wallet },
                      { id: "installments", name: "Pay in Installments", icon: Calendar },
                    ].map((method) => (
                      <div
                        key={method.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === method.id
                            ? "border-sheraton-gold bg-sheraton-gold/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setPaymentMethod(method.id as any)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            paymentMethod === method.id 
                              ? "border-sheraton-gold bg-sheraton-gold" 
                              : "border-gray-300"
                          }`} />
                          <method.icon className="h-5 w-5 text-sheraton-navy" />
                          <span className="font-medium text-sheraton-navy">{method.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {paymentMethod === "card" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name *
                        </label>
                        <Input
                          value={paymentDetails.cardName}
                          onChange={(e) => setPaymentDetails({...paymentDetails, cardName: e.target.value})}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number *
                        </label>
                        <Input
                          value={paymentDetails.cardNumber}
                          onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date *
                        </label>
                        <Input
                          value={paymentDetails.expiryDate}
                          onChange={(e) => setPaymentDetails({...paymentDetails, expiryDate: e.target.value})}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV *
                        </label>
                        <Input
                          value={paymentDetails.cvv}
                          onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                          placeholder="123"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Add-On Services</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={preferences.pickup}
                          onCheckedChange={(checked) => setPreferences({...preferences, pickup: checked})}
                        />
                        <div>
                          <p className="font-medium text-sheraton-navy">Hotel Pickup Service</p>
                          <p className="text-sm text-gray-600">Complimentary pickup from your hotel</p>
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">Included</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={preferences.insurance}
                          onCheckedChange={(checked) => setPreferences({...preferences, insurance: checked})}
                        />
                        <div>
                          <p className="font-medium text-sheraton-navy">Travel Insurance</p>
                          <p className="text-sm text-gray-600">Comprehensive coverage for your experiences</p>
                        </div>
                      </div>
                      <span className="font-medium text-sheraton-navy">
                        +${(subtotal * 0.08).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={preferences.photoPackage}
                          onCheckedChange={(checked) => setPreferences({...preferences, photoPackage: checked})}
                        />
                        <div>
                          <p className="font-medium text-sheraton-navy">Professional Photo Package</p>
                          <p className="text-sm text-gray-600">High-quality photos of your experiences</p>
                        </div>
                      </div>
                      <span className="font-medium text-sheraton-navy">+$75</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Loyalty Points</h3>
                  <div className="bg-sheraton-cream rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-sheraton-navy">Available Points</span>
                      <span className="font-semibold text-sheraton-navy">{loyaltyPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">Point Value</span>
                      <span className="text-sm text-gray-600">${(loyaltyPoints * 0.01).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={usePoints}
                        onCheckedChange={setUsePoints}
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Use loyalty points (Save up to ${Math.min(loyaltyPoints * 0.01, subtotal * 0.2).toFixed(2)})
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === "confirmation" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Booking Summary</h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-sheraton-cream to-sheraton-pearl rounded-lg flex items-center justify-center text-xl">
                            {item?.image}
                          </div>
                          <div>
                            <p className="font-medium text-sheraton-navy">{item?.title}</p>
                            <p className="text-sm text-gray-600">
                              {selectedDate[item?.id || ""]} • {item?.quantity} participants
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-sheraton-navy">
                          ${((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Lead Traveler</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-2">
                      <span className="font-medium text-sheraton-navy">
                        {travelersInfo.leadTraveler.firstName} {travelersInfo.leadTraveler.lastName}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{travelersInfo.leadTraveler.email}</p>
                      <p>{travelersInfo.leadTraveler.phone}</p>
                      {travelersInfo.leadTraveler.nationality && (
                        <p><strong>Nationality:</strong> {travelersInfo.leadTraveler.nationality}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Payment Method</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-sheraton-navy" />
                      <span className="font-medium text-sheraton-navy">
                        {paymentMethod === "card" && `**** **** **** ${paymentDetails.cardNumber.slice(-4)}`}
                        {paymentMethod === "room-charge" && "Room Charge"}
                        {paymentMethod === "paypal" && "PayPal"}
                        {paymentMethod === "installments" && "Pay in Installments"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Booking Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Experiences</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {preferences.insurance && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Travel Insurance</span>
                    <span className="font-medium">${addOns.insurance.toFixed(2)}</span>
                  </div>
                )}
                {preferences.photoPackage && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Photo Package</span>
                    <span className="font-medium">${addOns.photoPackage.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                {usePoints && pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Loyalty Points</span>
                    <span>-${pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold text-sheraton-navy">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                {step !== "experiences" && (
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                {step !== "confirmation" ? (
                  <Button 
                    onClick={handleNext} 
                    disabled={!validateStep()}
                    className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleBookExperiences}
                    disabled={isProcessing}
                    className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
                  >
                    {isProcessing ? "Processing..." : "Book Experiences"}
                  </Button>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure Booking</span>
                </div>
                <p>Free cancellation up to 24 hours before</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TravelCheckoutModal;
