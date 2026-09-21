import React, { useEffect, useRef, useState } from "react";
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
  Utensils,
  Car,
  Building,
  Wallet,
  Truck,
  ShoppingBag,
  Smartphone,
  Shield,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  X,
  ShoppingCart,
} from "lucide-react";
import {
  clearPendingCheckout,
  getPendingCheckout,
  savePendingCheckout,
  type FlutterwaveHostedSession,
  type ResumableMenuOrder,
} from "../../lib/flutterwave";
import { supabase } from "../../lib/supabase";
import { convertActiveMenuCart } from "../../lib/menuCart";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  currency?: string;
  image: string;
  cookTime: string;
}

interface CheckoutPageProps {
  onBack: () => void;
  cart: { [key: string]: number };
  menuItems: MenuItem[];
  onUpdateCart: (itemId: string, quantity: number) => void;
  onRemoveFromCart: (itemId: string) => void;
  resumableOrder?: ResumableMenuOrder;
  durableCartId?: string | null;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onBack,
  cart,
  menuItems,
  onUpdateCart,
  onRemoveFromCart,
  resumableOrder,
  durableCartId,
}) => {
  const [step, setStep] = useState<
    "cart" | "details" | "payment" | "confirmation"
  >("cart");
  const [orderType, setOrderType] = useState<
    "delivery" | "take-away" | "dine-in" | "room-service"
  >("dine-in");
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roomNumber: "",
    deliveryAddress: "",
    specialRequests: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "room-charge" | "cash" | "mobile-money"
  >("card");
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState<{
    id: string;
    orderNumber: string;
  } | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);
  const [usePoints, setUsePoints] = useState(false);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [tipPercentage, setTipPercentage] = useState<number>(18);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState("25-30 minutes");
  const [orderNumber, setOrderNumber] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const pendingCheckout = resumableOrder || getPendingCheckout();
    if (!pendingCheckout) return;

    setPendingPaymentOrder({
      id: pendingCheckout.orderId,
      orderNumber: pendingCheckout.orderNumber,
    });
    setOrderType(pendingCheckout.orderType);
    setPaymentMethod(pendingCheckout.paymentMethod);
    setTipAmount(pendingCheckout.tipAmount);
    setTipPercentage(pendingCheckout.tipPercentage);
    setUsePoints(pendingCheckout.usePoints);
    setStep("payment");
  }, [resumableOrder]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, email, phone, room_number")
        .eq("user_id", user.id)
        .maybeSingle();

      setCustomerInfo((current) => ({
        ...current,
        firstName: profile?.first_name || current.firstName,
        lastName: profile?.last_name || current.lastName,
        email: profile?.email || user.email || current.email,
        phone: profile?.phone || current.phone,
        roomNumber: profile?.room_number || current.roomNumber,
      }));
    };

    loadProfile().catch((error) => console.error("Unable to load checkout profile", error));
  }, []);

  const getCartItems = () => {
    return Object.entries(cart).map(([itemId, quantity]) => {
      const item = menuItems.find((i) => i.id === itemId);
      return { item, quantity };
    });
  };

  const getSubtotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find((i) => i.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getCurrency = () => {
    const currencies = new Set(
      getCartItems().map(({ item }) => item?.currency || "USD"),
    );
    return currencies.size === 1 ? [...currencies][0] : null;
  };

  const formatAmount = (amount: number, currency = getCurrency()) => {
    return currency
      ? new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount)
      : "Multiple currencies";
  };

  const getTax = () => {
    return getSubtotal() * 0.08; // 8% tax
  };

  const getServiceFee = () => {
    return orderType === "room-service" ? 5 : orderType === "delivery" ? 8 : 0;
  };

  const getPointsDiscount = () => {
    if (!usePoints) return 0;
    const maxDiscount = Math.min(loyaltyPoints / 100, getSubtotal() * 0.2); // 1 point = $0.01, max 20% discount
    return maxDiscount;
  };

  const getFinalTotal = () => {
    return (
      getSubtotal() +
      getTax() +
      getServiceFee() +
      tipAmount -
      getPointsDiscount()
    );
  };

  const calculateTip = (percentage: number) => {
    const tipAmount = (getSubtotal() + getTax() + getServiceFee()) * (percentage / 100);
    setTipAmount(tipAmount);
    setTipPercentage(percentage);
  };

  const startOnlinePayment = async ({ id, orderNumber }: { id: string; orderNumber: string }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Please sign in before paying.");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    let sessionResponse: Response;

    try {
      sessionResponse = await fetch("/api/payments/flutterwave/hosted-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          orderId: id,
          paymentAmount: getFinalTotal(),
          paymentCurrency: getCurrency(),
        }),
        signal: controller.signal,
      });
    } finally {
      window.clearTimeout(timeout);
    }
    const paymentSession = (await sessionResponse.json()) as FlutterwaveHostedSession | { error?: string };
    if (!sessionResponse.ok || !("paymentUrl" in paymentSession)) {
      throw new Error(("error" in paymentSession && paymentSession.error) || "Unable to prepare secure checkout.");
    }

    savePendingCheckout({
      orderId: id,
      orderNumber,
      cart,
      orderType,
      paymentMethod,
      tipAmount,
      tipPercentage,
      usePoints,
    });
    setIsRedirecting(true);
    // Leave the app as a full-document navigation so the provider owns the viewport.
    if (window.top && window.top !== window.self) {
      window.top.location.replace(paymentSession.paymentUrl);
    } else {
      window.location.replace(paymentSession.paymentUrl);
    }
  };

  const handlePlaceOrder = async () => {
    const isOnlinePayment = paymentMethod === "card" || paymentMethod === "mobile-money";
    setIsProcessing(true);
    setIsRedirecting(isOnlinePayment);
    setCheckoutError("");

    try {
      if (pendingPaymentOrder) {
        await startOnlinePayment(pendingPaymentOrder);
        return;
      }

      let { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { data: anonymousSession, error: anonymousError } = await supabase.auth.signInAnonymously();
        if (anonymousError || !anonymousSession.user) {
          throw new Error("Guest checkout is currently unavailable. Please sign in and try again.");
        }
        user = anonymousSession.user;
      }

      const currency = getCurrency();
      if (!currency) throw new Error("Please checkout items in the same currency.");

      const orderNumberValue = `SH${Date.now().toString().slice(-8)}`;
      const { data: order, error: orderError } = await supabase
        .from("menu_orders")
        .insert({
          order_number: orderNumberValue,
          user_id: user.id,
          order_type: orderType,
          status: "pending",
          payment_method: paymentMethod,
          payment_status: "pending",
          currency,
          first_name: customerInfo.firstName.trim(),
          last_name: customerInfo.lastName.trim(),
          email: customerInfo.email.trim(),
          phone: customerInfo.phone.trim(),
          room_number: customerInfo.roomNumber.trim() || null,
          delivery_address: customerInfo.deliveryAddress.trim() || null,
          special_requests: customerInfo.specialRequests.trim() || null,
          subtotal: getSubtotal(),
          tax_amount: getTax(),
          service_fee: getServiceFee(),
          tip_amount: tipAmount,
          points_discount: getPointsDiscount(),
          total_amount: getFinalTotal(),
        })
        .select("id, order_number")
        .single();

      if (orderError || !order) throw new Error("We could not place your order. Please try again.");

      const { error: itemsError } = await supabase.from("menu_order_items").insert(
        getCartItems()
          .filter(({ item }) => item)
          .map(({ item, quantity }) => ({
            order_id: order.id,
            menu_item_id: item!.id,
            item_name: item!.name,
            unit_price: item!.price,
            quantity,
            line_total: item!.price * quantity,
          })),
      );

      if (itemsError) throw new Error("We could not save the order items. Please try again.");

      await convertActiveMenuCart(durableCartId || null, order.id);

      const paymentOrder = { id: order.id, orderNumber: order.order_number };
      if (paymentMethod === "card" || paymentMethod === "mobile-money") {
        setPendingPaymentOrder(paymentOrder);
        await startOnlinePayment(paymentOrder);
        return;
      }

      setOrderNumber(order.order_number);
      setOrderConfirmed(true);
      setStep("confirmation");
    } catch (error) {
      console.error("Unable to process menu order", error);
      if (isMountedRef.current) {
        setIsProcessing(false);
        setIsRedirecting(false);
        setCheckoutError(error instanceof Error ? error.message : "We could not process your order.");
      }
    } finally {
      if (isMountedRef.current) setIsProcessing(false);
    }
  };

  const resetCheckout = () => {
    setStep("cart");
    setOrderType("dine-in");
    setPaymentMethod("card");
    setOrderConfirmed(false);
    setIsProcessing(false);
    setCustomerInfo({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      roomNumber: "",
      deliveryAddress: "",
      specialRequests: "",
    });
    setPendingPaymentOrder(null);
    setIsRedirecting(false);
    clearPendingCheckout();
    setUsePoints(false);
    setTipAmount(0);
    setTipPercentage(18);
    setCheckoutError("");
  };

  const handleBack = () => {
    resetCheckout();
    onBack();
  };

  const renderRedirectingStep = () => (
    <div
      className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-sheraton-navy px-6 text-center text-white"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-sheraton-gold/40 bg-sheraton-gold/10">
          <Shield className="h-8 w-8 text-sheraton-gold" aria-hidden="true" />
        </div>
        <h2 className="mt-7 text-2xl font-semibold">Opening secure payment</h2>
        <p className="mt-3 text-sm leading-6 text-white/75">
          We’re securely connecting you to Flutterwave. Please keep this window open while the payment page loads.
        </p>
        <div className="mx-auto mt-8 h-1.5 w-full overflow-hidden rounded-full bg-white/15" aria-hidden="true">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-sheraton-gold" />
        </div>
        <p className="mt-4 text-xs text-white/55">Your order is safely saved.</p>
      </div>
    </div>
  );

  const renderCartStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Order</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button variant={orderType === "delivery" ? "default" : "outline"} size="sm" onClick={() => setOrderType("delivery")} className={orderType === "delivery" ? "bg-sheraton-gold text-sheraton-navy" : ""}>
            <Truck className="h-4 w-4" /> Delivery
          </Button>
          <Button variant={orderType === "dine-in" ? "default" : "outline"} size="sm" onClick={() => setOrderType("dine-in")} className={orderType === "dine-in" ? "bg-sheraton-gold text-sheraton-navy" : ""}>
            <Utensils className="h-4 w-4" /> Dine In
          </Button>
          <Button variant={orderType === "take-away" ? "default" : "outline"} size="sm" onClick={() => setOrderType("take-away")} className={orderType === "take-away" ? "bg-sheraton-gold text-sheraton-navy" : ""}>
            <ShoppingBag className="h-4 w-4" /> Take Away
          </Button>
          <Button variant={orderType === "room-service" ? "default" : "outline"} size="sm" onClick={() => setOrderType("room-service")} className={orderType === "room-service" ? "bg-sheraton-gold text-sheraton-navy" : ""}>
            <Building className="h-4 w-4" /> Room Service
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {getCartItems().map(({ item, quantity }) => {
          if (!item) return null;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{item.image}</span>
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">{formatAmount(item.price, item.currency || "USD")} each</p>
                  <p className="text-xs text-gray-500">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {item.cookTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateCart(item.id, quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateCart(item.id, quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveFromCart(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatAmount(getSubtotal())}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (8%)</span>
          <span>{formatAmount(getTax())}</span>
        </div>
        {orderType === "room-service" && (
          <div className="flex justify-between">
            <span>Service Fee</span>
            <span>{formatAmount(getServiceFee())}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{formatAmount(getSubtotal() + getTax() + getServiceFee())}</span>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          Continue Shopping
        </Button>
        <Button
          onClick={() => setStep("details")}
          className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
        >
          Proceed to Details
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Order Details</h3>
        <Badge className="bg-sheraton-gold text-sheraton-navy">
          {{
            delivery: "Delivery",
            "take-away": "Take Away",
            "dine-in": "Dine In",
            "room-service": "Room Service",
          }[orderType]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">First Name *</label>
          <Input
            value={customerInfo.firstName}
            onChange={(e) =>
              setCustomerInfo((prev) => ({
                ...prev,
                firstName: e.target.value,
              }))
            }
            placeholder="Enter first name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Last Name *</label>
          <Input
            value={customerInfo.lastName}
            onChange={(e) =>
              setCustomerInfo((prev) => ({ ...prev, lastName: e.target.value }))
            }
            placeholder="Enter last name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email *</label>
        <Input
          type="email"
          value={customerInfo.email}
          onChange={(e) =>
            setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="Enter email for receipt"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Phone Number *</label>
        <Input
          type="tel"
          value={customerInfo.phone}
          onChange={(e) =>
            setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))
          }
          placeholder="Enter phone number"
        />
      </div>

      {(orderType === "room-service" || orderType === "delivery") && (
        <div>
          <label className="block text-sm font-medium mb-2">
            {orderType === "room-service" ? "Room Number *" : "Delivery Address *"}
          </label>
          <Input
            value={orderType === "room-service" ? customerInfo.roomNumber : customerInfo.deliveryAddress}
            onChange={(e) => setCustomerInfo((prev) => orderType === "room-service"
              ? { ...prev, roomNumber: e.target.value }
              : { ...prev, deliveryAddress: e.target.value })}
            placeholder={orderType === "room-service" ? "Enter room number" : "Enter delivery address"}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Special Requests (Optional)
        </label>
        <Textarea
          value={customerInfo.specialRequests}
          onChange={(e) =>
            setCustomerInfo((prev) => ({
              ...prev,
              specialRequests: e.target.value,
            }))
          }
          placeholder="Any allergies, dietary restrictions, or special instructions..."
          className="min-h-[80px]"
        />
      </div>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={() => setStep("cart")}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Button>
        <Button
          onClick={() => setStep("payment")}
          className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
          disabled={
            !customerInfo.firstName ||
            !customerInfo.lastName ||
            !customerInfo.email ||
            !customerInfo.phone ||
            (orderType === "room-service" && !customerInfo.roomNumber) ||
            (orderType === "delivery" && !customerInfo.deliveryAddress)
          }
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
              -{formatAmount(getPointsDiscount())}
            </span>
          )}
        </div>
        {usePoints && (
          <p className="text-xs text-gray-600 mt-1">
            Using {Math.floor(getPointsDiscount() * 100)} points for discount
          </p>
        )}
      </div>

      {/* Tip Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Add Tip (Optional)</label>
        <div className="grid grid-cols-4 gap-2">
          {[15, 18, 20, 25].map((percentage) => (
            <Button
              key={percentage}
              variant={tipPercentage === percentage ? "default" : "outline"}
              size="sm"
              onClick={() => calculateTip(percentage)}
              className={
                tipPercentage === percentage
                  ? "bg-sheraton-gold text-sheraton-navy"
                  : ""
              }
            >
              {percentage}%
            </Button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">Custom:</span>
          <Input
            type="number"
            value={tipAmount.toFixed(2)}
            onChange={(e) => {
              const amount = parseFloat(e.target.value) || 0;
              setTipAmount(amount);
              setTipPercentage(0);
            }}
            className="w-20"
            step="0.01"
            min="0"
          />
          <span className="text-sm">{getCurrency() || "Amount"}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">Payment Method</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
            variant={paymentMethod === "room-charge" ? "default" : "outline"}
            onClick={() => setPaymentMethod("room-charge")}
            className={
              paymentMethod === "room-charge"
                ? "bg-sheraton-gold text-sheraton-navy"
                : ""
            }
          >
            <Building className="h-4 w-4 mr-2" />
            Room
          </Button>
          <Button
            variant={paymentMethod === "mobile-money" ? "default" : "outline"}
            onClick={() => setPaymentMethod("mobile-money")}
            className={paymentMethod === "mobile-money" ? "bg-sheraton-gold text-sheraton-navy" : ""}
          >
            <Smartphone className="h-4 w-4 mr-2" /> Mobile Money
          </Button>
          <Button
            variant={paymentMethod === "cash" ? "default" : "outline"}
            onClick={() => setPaymentMethod("cash")}
            className={
              paymentMethod === "cash"
                ? "bg-sheraton-gold text-sheraton-navy"
                : ""
            }
          >
            <Wallet className="h-4 w-4 mr-2" />
            Cash
          </Button>
        </div>
      </div>

      {paymentMethod === "card" && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-sheraton-navy">
            <Shield className="h-4 w-4 text-sheraton-gold" />
            Secure card checkout
          </div>
          <p className="mt-2 text-sm text-gray-600">
            You’ll continue to Flutterwave’s secure payment page. Your card details go directly to Flutterwave and are never handled by Sheraton Special.
          </p>
        </div>
      )}

      {paymentMethod === "room-charge" && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">
              Charge to Room {customerInfo.roomNumber}
            </span>
          </div>
          <p className="text-sm text-blue-700">
            This order will be added to your room bill. You can pay at checkout.
          </p>
        </div>
      )}

      {paymentMethod === "mobile-money" && (
        <div className="rounded-lg bg-purple-50 p-4">
          <p className="text-sm text-purple-700">
            You’ll continue to Flutterwave’s secure payment page to approve Mobile Money using the phone number in your order details.
          </p>
        </div>
      )}

      {paymentMethod === "cash" && (
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Wallet className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-900">Cash Payment</span>
          </div>
          <p className="text-sm text-green-700">
            Please have exact change ready when your order arrives.
          </p>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-medium mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatAmount(getSubtotal())}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatAmount(getTax())}</span>
          </div>
          {getServiceFee() > 0 && (
            <div className="flex justify-between">
              <span>Service Fee</span>
              <span>{formatAmount(getServiceFee())}</span>
            </div>
          )}
          {tipAmount > 0 && (
            <div className="flex justify-between">
              <span>Tip</span>
              <span>{formatAmount(tipAmount)}</span>
            </div>
          )}
          {usePoints && getPointsDiscount() > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Points Discount</span>
              <span>-{formatAmount(getPointsDiscount())}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatAmount(getFinalTotal())}</span>
          </div>
        </div>
      </div>

      {checkoutError && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{checkoutError}</p>}

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
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
        >
          {isProcessing ? (
            "Processing..."
          ) : (
            <>
              {paymentMethod === "card" || paymentMethod === "mobile-money" ? "Pay securely" : "Place Order"} {formatAmount(getFinalTotal())}
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
          Order Confirmed!
        </h3>
        <p className="text-gray-600">
          Thank you for your order. We're preparing your delicious meal.
        </p>
      </div>

      <div className="bg-sheraton-cream rounded-lg p-4">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-600">Order Number</div>
          <div className="text-2xl font-bold text-sheraton-navy">
            {orderNumber}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Estimated Time</div>
            <div className="font-medium">{estimatedTime}</div>
          </div>
          <div>
            <div className="text-gray-600">
              {paymentMethod === "card" || paymentMethod === "mobile-money" ? "Payment received" : "Amount due"}
            </div>
            <div className="font-medium">{formatAmount(getFinalTotal())}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Your order has been recorded. Receipt notifications will be added later.</span>
        </div>
        {orderType === "room-service" && (
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Delivering to Room {customerInfo.roomNumber}</span>
          </div>
        )}
        {orderType === "delivery" && (
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Delivering to {customerInfo.deliveryAddress}</span>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          Order More
        </Button>
        <Button
          onClick={handleBack}
          className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
        >
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-background">
      <main aria-labelledby="checkout-title" className="container py-8 sm:py-10">
        <div className="mx-auto max-w-3xl">
          <header className="mb-6 flex items-start justify-between gap-4 border-b pb-6">
            <div>
              <h1 id="checkout-title" className="flex items-center space-x-2 text-lg font-semibold">
                <Crown className="h-5 w-5 text-sheraton-gold" />
                <span>Complete Your Order</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review your order, then complete payment securely in one clear checkout flow.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isProcessing}
              className="shrink-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Menu
            </Button>
          </header>

          {/* Step Indicator */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {[
            { id: "cart", label: "Cart", icon: ShoppingCart },
            { id: "details", label: "Details", icon: User },
            { id: "payment", label: "Payment", icon: CreditCard },
            { id: "confirmation", label: "Confirm", icon: CheckCircle },
          ].map((stepItem, index) => {
            const isActive = step === stepItem.id;
            const isCompleted =
              (step === "details" && stepItem.id === "cart") ||
              (step === "payment" &&
                ["cart", "details"].includes(stepItem.id)) ||
              (step === "confirmation" &&
                ["cart", "details", "payment"].includes(stepItem.id));

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

        {/* Content */}
        {isRedirecting ? renderRedirectingStep() : (
          <>
            {step === "cart" && renderCartStep()}
            {step === "details" && renderDetailsStep()}
            {step === "payment" && renderPaymentStep()}
            {step === "confirmation" && renderConfirmationStep()}
          </>
        )}
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
