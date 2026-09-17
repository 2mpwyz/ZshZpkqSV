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
  Truck,
  Package,
  Home,
  Building,
  Wallet,
  Shield,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  X,
  ShoppingCart,
  CreditCard as CardIcon,
  DollarSign,
  Globe,
  Heart,
} from "lucide-react";

interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  bestseller: boolean;
  tags: string[];
}

interface ShopCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { [key: string]: number };
  products: ShopProduct[];
  onUpdateCart: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
}

const ShopCheckoutModal: React.FC<ShopCheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  products,
  onUpdateCart,
  onRemoveFromCart,
  onClearCart,
}) => {
  const [step, setStep] = useState<
    "cart" | "shipping" | "payment" | "confirmation"
  >("cart");
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });
  const [shippingMethod, setShippingMethod] = useState<
    "standard" | "express" | "overnight" | "pickup"
  >("standard");
  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    firstName: "",
    lastName: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "paypal" | "apple-pay" | "google-pay"
  >("card");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState(2450);
  const [usePoints, setUsePoints] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  const cartItems = Object.entries(cart).map(([productId, quantity]) => {
    const product = products.find((p) => p.id === productId);
    return product ? { ...product, quantity } : null;
  }).filter(Boolean);

  const subtotal = cartItems.reduce(
    (total, item) => total + (item?.price || 0) * (item?.quantity || 0),
    0
  );

  const shippingCosts = {
    standard: 0,
    express: 15,
    overnight: 25,
    pickup: 0,
  };

  const shippingCost = subtotal >= 100 ? 0 : shippingCosts[shippingMethod];
  const tax = subtotal * 0.08;
  const pointsDiscount = usePoints ? Math.min(loyaltyPoints * 0.01, subtotal * 0.2) : 0;
  const total = subtotal + shippingCost + tax - pointsDiscount;

  const getStepProgress = () => {
    const steps = ["cart", "shipping", "payment", "confirmation"];
    return ((steps.indexOf(step) + 1) / steps.length) * 100;
  };

  const validateStep = () => {
    switch (step) {
      case "cart":
        return cartItems.length > 0;
      case "shipping":
        return (
          shippingInfo.firstName &&
          shippingInfo.lastName &&
          shippingInfo.email &&
          shippingInfo.phone &&
          shippingInfo.address &&
          shippingInfo.city &&
          shippingInfo.state &&
          shippingInfo.zipCode
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
    
    const steps = ["cart", "shipping", "payment", "confirmation"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1] as any);
    }
  };

  const handleBack = () => {
    const steps = ["cart", "shipping", "payment", "confirmation"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1] as any);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const orderNum = `SH${Date.now().toString().slice(-6)}`;
    setOrderNumber(orderNum);
    
    // Calculate delivery date based on shipping method
    const deliveryDays = {
      standard: 5,
      express: 2,
      overnight: 1,
      pickup: 0,
    };
    
    if (shippingMethod === "pickup") {
      setEstimatedDelivery("Available for pickup tomorrow after 2 PM");
    } else {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + deliveryDays[shippingMethod]);
      setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    }
    
    setOrderConfirmed(true);
    setIsProcessing(false);
    onClearCart();
  };

  const resetModal = () => {
    setStep("cart");
    setOrderConfirmed(false);
    setIsProcessing(false);
    setShippingInfo({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      address2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    });
    setBillingInfo({
      sameAsShipping: true,
      firstName: "",
      lastName: "",
      address: "",
      address2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    });
    setPaymentDetails({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardName: "",
    });
    setUsePoints(false);
    setIsGift(false);
    setGiftMessage("");
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
            <h2 className="text-2xl font-bold text-sheraton-navy mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase from Sheraton Special Collection.
            </p>
            
            <div className="bg-sheraton-cream rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Order Number</span>
                <span className="font-semibold text-sheraton-navy">{orderNumber}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="font-semibold text-sheraton-navy">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {shippingMethod === "pickup" ? "Pickup" : "Delivery"}
                </span>
                <span className="font-semibold text-sheraton-navy">{estimatedDelivery}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleClose} 
                className="w-full bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
              >
                Continue Shopping
              </Button>
              <Button variant="outline" className="w-full">
                Track Your Order
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
            {step === "cart" && "Shopping Cart"}
            {step === "shipping" && "Shipping Information"}
            {step === "payment" && "Payment Details"}
            {step === "confirmation" && "Order Review"}
          </DialogTitle>
          <div className="mt-4">
            <Progress value={getStepProgress()} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span className={step === "cart" ? "text-sheraton-navy font-medium" : ""}>Cart</span>
              <span className={step === "shipping" ? "text-sheraton-navy font-medium" : ""}>Shipping</span>
              <span className={step === "payment" ? "text-sheraton-navy font-medium" : ""}>Payment</span>
              <span className={step === "confirmation" ? "text-sheraton-navy font-medium" : ""}>Review</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "cart" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-sheraton-navy">Your Items</h3>
                  <Badge variant="secondary">{cartItems.length} items</Badge>
                </div>
                
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item?.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gradient-to-br from-sheraton-cream to-sheraton-pearl rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-sheraton-gold" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sheraton-navy">{item?.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-1">{item?.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-semibold text-sheraton-navy">${item?.price}</span>
                            {item?.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ${item?.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveFromCart(item?.id || "")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === "shipping" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Shipping Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <Input
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <Input
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <Input
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company (Optional)
                      </label>
                      <Input
                        value={shippingInfo.company}
                        onChange={(e) => setShippingInfo({...shippingInfo, company: e.target.value})}
                        placeholder="Company Name"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <Input
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 2 (Optional)
                      </label>
                      <Input
                        value={shippingInfo.address2}
                        onChange={(e) => setShippingInfo({...shippingInfo, address2: e.target.value})}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <Input
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <Input
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <Input
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <Select value={shippingInfo.country} onValueChange={(value) => setShippingInfo({...shippingInfo, country: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Shipping Method</h3>
                  <div className="space-y-3">
                    {[
                      { id: "standard", name: "Standard Shipping", time: "5-7 business days", price: 0 },
                      { id: "express", name: "Express Shipping", time: "2-3 business days", price: 15 },
                      { id: "overnight", name: "Overnight Shipping", time: "Next business day", price: 25 },
                      { id: "pickup", name: "Store Pickup", time: "Available tomorrow", price: 0 },
                    ].map((method) => (
                      <div
                        key={method.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          shippingMethod === method.id
                            ? "border-sheraton-gold bg-sheraton-gold/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setShippingMethod(method.id as any)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                shippingMethod === method.id 
                                  ? "border-sheraton-gold bg-sheraton-gold" 
                                  : "border-gray-300"
                              }`} />
                              <span className="font-medium text-sheraton-navy">{method.name}</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-6">{method.time}</p>
                          </div>
                          <span className="font-semibold text-sheraton-navy">
                            {subtotal >= 100 && method.id !== "pickup" ? "FREE" : 
                             method.price === 0 ? "FREE" : `$${method.price}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch
                      checked={isGift}
                      onCheckedChange={setIsGift}
                    />
                    <label className="text-sm font-medium text-gray-700">
                      This is a gift
                    </label>
                  </div>
                  {isGift && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gift Message (Optional)
                      </label>
                      <Textarea
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        placeholder="Enter your gift message here..."
                        rows={3}
                      />
                    </div>
                  )}
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
                      { id: "paypal", name: "PayPal", icon: Wallet },
                      { id: "apple-pay", name: "Apple Pay", icon: DollarSign },
                      { id: "google-pay", name: "Google Pay", icon: Globe },
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
                        Use loyalty points (Save up to ${Math.min(loyaltyPoints * 0.01, subtotal * 0.2).toFixed(2)})
                      </label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      checked={!billingInfo.sameAsShipping}
                      onChange={(e) => setBillingInfo({...billingInfo, sameAsShipping: !e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Billing address is different from shipping address
                    </label>
                  </div>

                  {!billingInfo.sameAsShipping && (
                    <div>
                      <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Billing Address</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <Input
                            value={billingInfo.firstName}
                            onChange={(e) => setBillingInfo({...billingInfo, firstName: e.target.value})}
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <Input
                            value={billingInfo.lastName}
                            onChange={(e) => setBillingInfo({...billingInfo, lastName: e.target.value})}
                            placeholder="Doe"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address *
                          </label>
                          <Input
                            value={billingInfo.address}
                            onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                            placeholder="123 Main Street"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <Input
                            value={billingInfo.city}
                            onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                            placeholder="New York"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP Code *
                          </label>
                          <Input
                            value={billingInfo.zipCode}
                            onChange={(e) => setBillingInfo({...billingInfo, zipCode: e.target.value})}
                            placeholder="10001"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === "confirmation" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-sheraton-cream to-sheraton-pearl rounded-lg flex items-center justify-center">
                            <Package className="h-4 w-4 text-sheraton-gold" />
                          </div>
                          <div>
                            <p className="font-medium text-sheraton-navy">{item?.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item?.quantity}</p>
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
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Shipping Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-2">
                      <span className="font-medium text-sheraton-navy">
                        {shippingInfo.firstName} {shippingInfo.lastName}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{shippingInfo.address}</p>
                      {shippingInfo.address2 && <p>{shippingInfo.address2}</p>}
                      <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                      <p>{shippingInfo.country}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-sheraton-navy">
                        Shipping Method: {shippingMethod === "standard" && "Standard Shipping"}
                        {shippingMethod === "express" && "Express Shipping"}
                        {shippingMethod === "overnight" && "Overnight Shipping"}
                        {shippingMethod === "pickup" && "Store Pickup"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Payment Method</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CardIcon className="h-5 w-5 text-sheraton-navy" />
                      <span className="font-medium text-sheraton-navy">
                        {paymentMethod === "card" && `**** **** **** ${paymentDetails.cardNumber.slice(-4)}`}
                        {paymentMethod === "paypal" && "PayPal"}
                        {paymentMethod === "apple-pay" && "Apple Pay"}
                        {paymentMethod === "google-pay" && "Google Pay"}
                      </span>
                    </div>
                  </div>
                </div>

                {isGift && giftMessage && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Gift Message</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">{giftMessage}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-sheraton-navy mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                  </span>
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

              {subtotal >= 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Free shipping applied!
                    </span>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {step !== "cart" && (
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
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure SSL Encryption</span>
                </div>
                <p>Your payment information is safe and secure</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShopCheckoutModal;
