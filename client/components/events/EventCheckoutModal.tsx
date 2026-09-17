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
  Award,
  Wallet,
  Shield,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  X,
  Ticket,
  Heart,
  Camera,
  Download,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  capacity: number;
  attending: number;
  category: string;
  image: string;
  featured: boolean;
  rating: number;
  host: string;
}

interface EventCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { [key: string]: number };
  events: Event[];
  onUpdateCart: (eventId: string, quantity: number) => void;
  onRemoveFromCart: (eventId: string) => void;
  onClearCart: () => void;
}

const EventCheckoutModal: React.FC<EventCheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  events,
  onUpdateCart,
  onRemoveFromCart,
  onClearCart,
}) => {
  const [step, setStep] = useState<
    "tickets" | "details" | "payment" | "confirmation"
  >("tickets");
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    dietaryRestrictions: "",
    specialRequests: "",
    emergencyContact: "",
    emergencyPhone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "room-charge" | "paypal" | "apple-pay"
  >("card");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState(1850);
  const [usePoints, setUsePoints] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [ticketType, setTicketType] = useState<{[key: string]: string}>({});

  const cartItems = Object.entries(cart).map(([eventId, quantity]) => {
    const event = events.find((e) => e.id === eventId);
    return event ? { ...event, quantity } : null;
  }).filter(Boolean);

  const subtotal = cartItems.reduce(
    (total, item) => total + (item?.price || 0) * (item?.quantity || 0),
    0
  );

  const serviceFee = subtotal * 0.05; // 5% service fee
  const tax = subtotal * 0.08;
  const pointsDiscount = usePoints ? Math.min(loyaltyPoints * 0.01, subtotal * 0.15) : 0;
  const total = subtotal + serviceFee + tax - pointsDiscount;

  const getStepProgress = () => {
    const steps = ["tickets", "details", "payment", "confirmation"];
    return ((steps.indexOf(step) + 1) / steps.length) * 100;
  };

  const validateStep = () => {
    switch (step) {
      case "tickets":
        return cartItems.length > 0;
      case "details":
        return (
          guestInfo.firstName &&
          guestInfo.lastName &&
          guestInfo.email &&
          guestInfo.phone
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
    
    const steps = ["tickets", "details", "payment", "confirmation"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1] as any);
    }
  };

  const handleBack = () => {
    const steps = ["tickets", "details", "payment", "confirmation"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1] as any);
    }
  };

  const handleBookEvents = async () => {
    setIsProcessing(true);
    
    // Simulate booking processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const confirmNum = `EVT${Date.now().toString().slice(-6)}`;
    setConfirmationNumber(confirmNum);
    setOrderConfirmed(true);
    setIsProcessing(false);
    onClearCart();
  };

  const resetModal = () => {
    setStep("tickets");
    setOrderConfirmed(false);
    setIsProcessing(false);
    setGuestInfo({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      dietaryRestrictions: "",
      specialRequests: "",
      emergencyContact: "",
      emergencyPhone: "",
    });
    setPaymentDetails({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardName: "",
    });
    setUsePoints(false);
    setTicketType({});
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
            <h2 className="text-2xl font-bold text-sheraton-navy mb-2">Event Tickets Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your event tickets have been booked successfully.
            </p>
            
            <div className="bg-sheraton-cream rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Confirmation Number</span>
                <span className="font-semibold text-sheraton-navy">{confirmationNumber}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="font-semibold text-sheraton-navy">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Events Booked</span>
                <span className="font-semibold text-sheraton-navy">{cartItems.length}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleClose} 
                className="w-full bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
              >
                <Ticket className="h-4 w-4 mr-2" />
                View My Events
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Tickets
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-sheraton-navy">
            {step === "tickets" && "Event Tickets"}
            {step === "details" && "Guest Information"}
            {step === "payment" && "Payment Details"}
            {step === "confirmation" && "Booking Review"}
          </DialogTitle>
          <div className="mt-4">
            <Progress value={getStepProgress()} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span className={step === "tickets" ? "text-sheraton-navy font-medium" : ""}>Tickets</span>
              <span className={step === "details" ? "text-sheraton-navy font-medium" : ""}>Details</span>
              <span className={step === "payment" ? "text-sheraton-navy font-medium" : ""}>Payment</span>
              <span className={step === "confirmation" ? "text-sheraton-navy font-medium" : ""}>Review</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "tickets" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-sheraton-navy">Your Event Tickets</h3>
                  <Badge variant="secondary">{cartItems.length} events</Badge>
                </div>
                
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No events selected</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item?.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-sheraton-cream to-sheraton-pearl rounded-lg flex items-center justify-center">
                            <Award className="h-6 w-6 text-sheraton-gold" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-sheraton-navy">{item?.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">{item?.description}</p>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {item?.date} at {item?.time}
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {item?.location}
                                  </div>
                                  <div className="flex items-center">
                                    <Star className="h-3 w-3 mr-1" />
                                    {item?.rating} • Hosted by {item?.host}
                                  </div>
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

                            <div className="mt-4 grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Ticket Type
                                </label>
                                <Select 
                                  value={ticketType[item?.id || ""] || "standard"} 
                                  onValueChange={(value) => setTicketType({...ticketType, [item?.id || ""]: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="standard">Standard - ${item?.price}</SelectItem>
                                    <SelectItem value="vip">VIP - ${(item?.price || 0) * 1.5}</SelectItem>
                                    <SelectItem value="premium">Premium - ${(item?.price || 0) * 2}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Quantity
                                </label>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onUpdateCart(item?.id || "", Math.max(0, (item?.quantity || 1) - 1))}
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
                            </div>

                            <div className="mt-3 text-right">
                              <span className="text-lg font-semibold text-sheraton-navy">
                                ${((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === "details" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Guest Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <Input
                        value={guestInfo.firstName}
                        onChange={(e) => setGuestInfo({...guestInfo, firstName: e.target.value})}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <Input
                        value={guestInfo.lastName}
                        onChange={(e) => setGuestInfo({...guestInfo, lastName: e.target.value})}
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <Input
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company (Optional)
                      </label>
                      <Input
                        value={guestInfo.company}
                        onChange={(e) => setGuestInfo({...guestInfo, company: e.target.value})}
                        placeholder="Company Name"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dietary Restrictions / Allergies
                      </label>
                      <Input
                        value={guestInfo.dietaryRestrictions}
                        onChange={(e) => setGuestInfo({...guestInfo, dietaryRestrictions: e.target.value})}
                        placeholder="Vegetarian, Gluten-free, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requests
                      </label>
                      <Textarea
                        value={guestInfo.specialRequests}
                        onChange={(e) => setGuestInfo({...guestInfo, specialRequests: e.target.value})}
                        placeholder="Any special needs or requests..."
                        rows={3}
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
                        value={guestInfo.emergencyContact}
                        onChange={(e) => setGuestInfo({...guestInfo, emergencyContact: e.target.value})}
                        placeholder="Contact Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Emergency Contact Phone
                      </label>
                      <Input
                        value={guestInfo.emergencyPhone}
                        onChange={(e) => setGuestInfo({...guestInfo, emergencyPhone: e.target.value})}
                        placeholder="(555) 123-4567"
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
                      { id: "apple-pay", name: "Apple Pay", icon: Phone },
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
                        Use loyalty points (Save up to ${Math.min(loyaltyPoints * 0.01, subtotal * 0.15).toFixed(2)})
                      </label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Event Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={addToCalendar}
                        onCheckedChange={setAddToCalendar}
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Automatically add events to my calendar
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
                          <div className="w-12 h-12 bg-gradient-to-br from-sheraton-cream to-sheraton-pearl rounded-lg flex items-center justify-center">
                            <Award className="h-4 w-4 text-sheraton-gold" />
                          </div>
                          <div>
                            <p className="font-medium text-sheraton-navy">{item?.title}</p>
                            <p className="text-sm text-gray-600">{item?.date} • Qty: {item?.quantity}</p>
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
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Guest Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-2">
                      <span className="font-medium text-sheraton-navy">
                        {guestInfo.firstName} {guestInfo.lastName}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{guestInfo.email}</p>
                      <p>{guestInfo.phone}</p>
                      {guestInfo.company && <p>{guestInfo.company}</p>}
                      {guestInfo.dietaryRestrictions && (
                        <p><strong>Dietary:</strong> {guestInfo.dietaryRestrictions}</p>
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
                        {paymentMethod === "apple-pay" && "Apple Pay"}
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
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">${serviceFee.toFixed(2)}</span>
                </div>
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
                {step !== "tickets" && (
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
                    onClick={handleBookEvents}
                    disabled={isProcessing}
                    className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
                  >
                    {isProcessing ? "Processing..." : "Book Events"}
                  </Button>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure Payment Processing</span>
                </div>
                <p>Your information is protected and secure</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventCheckoutModal;
