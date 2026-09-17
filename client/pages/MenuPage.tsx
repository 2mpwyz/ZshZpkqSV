import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import CheckoutPage from "../components/checkout/CheckoutPage";
import { menuItemFromDatabaseRow, MenuItem } from "../lib/menuData";
import { supabase } from "../lib/supabase";
import { getPendingCheckout, type ResumableMenuOrder } from "../lib/flutterwave";
import { loadActiveMenuCart, syncActiveMenuCart } from "../lib/menuCart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
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
import { Separator } from "../components/ui/separator";
import { Progress } from "../components/ui/progress";
import {
  Crown,
  QrCode,
  Clock,
  Star,
  Heart,
  Utensils,
  Coffee,
  Wine,
  IceCream,
  Search,
  Filter,
  ShoppingCart,
  Plus,
  Minus,
  Leaf,
  Flame,
  Fish,
  Apple,
  AlertCircle,
  TrendingUp,
  Timer,
  Users,
  ChefHat,
  Globe,
  Zap,
  Bell,
  CheckCircle,
  Gift,
} from "lucide-react";

const MenuPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("food");
  const [showCheckoutPage, setShowCheckoutPage] = useState(false);
  const [resumableOrder, setResumableOrder] = useState<ResumableMenuOrder | undefined>();
  const [durableCartId, setDurableCartId] = useState<string | null>(null);
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const pendingCheckout = getPendingCheckout();
    if (pendingCheckout) {
      setCart(pendingCheckout.cart);
      setShowCheckoutPage(true);
      setCartReady(true);
      return;
    }

    loadActiveMenuCart()
      .then((savedCart) => {
        if (!savedCart) return;
        setDurableCartId(savedCart.id);
        setCart(Object.fromEntries(savedCart.items.map((item) => [item.menu_item_id, Number(item.quantity)])));
      })
      .catch((error) => console.error("Unable to load saved menu cart", error))
      .finally(() => setCartReady(true));
  }, []);

  useEffect(() => {
    let active = true;

    const restoreUnpaidOrder = async () => {
      if (getPendingCheckout()) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: order } = await supabase
        .from("menu_orders")
        .select("id, order_number, order_type, payment_method, tip_amount, points_discount")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .in("payment_status", ["pending", "cancelled", "failed"])
        .in("payment_method", ["card", "mobile-money"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!order || !active) return;

      const { data: orderItems } = await supabase
        .from("menu_order_items")
        .select("menu_item_id, quantity")
        .eq("order_id", order.id);

      if (!orderItems?.length || !active) return;

      const restoredCart = Object.fromEntries(
        orderItems.map((item) => [item.menu_item_id, Number(item.quantity)]),
      );
      const restoredOrder: ResumableMenuOrder = {
        orderId: order.id,
        orderNumber: order.order_number,
        cart: restoredCart,
        orderType: order.order_type,
        paymentMethod: order.payment_method,
        tipAmount: Number(order.tip_amount || 0),
        tipPercentage: 0,
        usePoints: Number(order.points_discount || 0) > 0,
      };

      setCart(restoredCart);
      setResumableOrder(restoredOrder);
      setShowCheckoutPage(true);
    };

    restoreUnpaidOrder().catch((error) => console.error("Unable to restore unpaid menu order", error));
    return () => {
      active = false;
    };
  }, []);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuItemsReady, setMenuItemsReady] = useState(false);

  useEffect(() => {
    if (!cartReady || !menuItemsReady || (!durableCartId && Object.keys(cart).length === 0)) return;

    const timeout = window.setTimeout(() => {
      const items = Object.entries(cart)
        .map(([menuItemId, quantity]) => {
          const item = menuItems.find((menuItem) => menuItem.id === menuItemId);
          return item ? { menuItemId, quantity, unitPrice: item.price } : null;
        })
        .filter((item): item is { menuItemId: string; quantity: number; unitPrice: number } => Boolean(item));

      syncActiveMenuCart(durableCartId, items)
        .then((cartId) => setDurableCartId(cartId))
        .catch((error) => console.error("Unable to save menu cart", error));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [cart, cartReady, durableCartId, menuItems, menuItemsReady]);

  const categories = [
    { id: "all", name: "All Items", icon: Utensils },
    { id: "appetizers", name: "Appetizers", icon: Coffee },
    { id: "mains", name: "Main Courses", icon: ChefHat },
    { id: "desserts", name: "Desserts", icon: IceCream },
    { id: "beverages", name: "Beverages", icon: Wine },
    { id: "special", name: "Special Offers", icon: Crown },
  ];

  useEffect(() => {
    supabase
      .from("menu_items")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMenuItems(data.map(menuItemFromDatabaseRow));
      })
      .finally(() => setMenuItemsReady(true));
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (itemId: string) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const updateCart = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      });
    } else {
      setCart((prev) => ({ ...prev, [itemId]: quantity }));
    }
  };

  const removeFromCartCompletely = (itemId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find((i) => i.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getCartCurrency = () => {
    const currencies = new Set(
      Object.keys(cart).map((itemId) => menuItems.find((item) => item.id === itemId)?.currency || "USD"),
    );
    return currencies.size === 1 ? [...currencies][0] : null;
  };

  const formatCartTotal = () => {
    const currency = getCartCurrency();
    return currency ? formatPrice(getTotalPrice(), currency) : "Multiple currencies";
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const getAvailabilityStatus = (item: any) => {
    const percentage = (item.availability / item.maxAvailability) * 100;
    if (percentage === 0)
      return { status: "out", color: "text-red-500", message: "Sold Out" };
    if (percentage < 25)
      return {
        status: "low",
        color: "text-orange-500",
        message: "Almost Gone!",
      };
    if (percentage < 50)
      return { status: "medium", color: "text-yellow-500", message: "Limited" };
    return { status: "good", color: "text-green-500", message: "Available" };
  };

  const formatPrice = (amount: number, currency = "USD") =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);

  const getCurrentOffer = () => {
    const hour = currentTime.getHours();
    if (hour >= 11 && hour < 15) {
      return {
        title: "Lunch Special",
        description: "Order now and skip the queue - you come first!",
        emoji: "🍽️",
        countdown: new Date(
          currentTime.getTime() +
            (15 - hour) * 60 * 60 * 1000 -
            currentTime.getMinutes() * 60 * 1000,
        ),
      };
    } else if (hour >= 17 && hour < 23) {
      return {
        title: "Evening Delight",
        description: "Live jazz band + special cocktail prices",
        emoji: "🎷",
        countdown: new Date(
          currentTime.getTime() +
            (23 - hour) * 60 * 60 * 1000 -
            currentTime.getMinutes() * 60 * 1000,
        ),
      };
    }
    return null;
  };

  const currentOffer = getCurrentOffer();

  if (showCheckoutPage) {
    return (
      <CheckoutPage
        onBack={() => setShowCheckoutPage(false)}
        cart={cart}
        menuItems={menuItems}
        onUpdateCart={updateCart}
        onRemoveFromCart={removeFromCartCompletely}
        resumableOrder={resumableOrder}
        durableCartId={durableCartId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sheraton-cream to-background">
      <div className="container py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <QrCode className="h-8 w-8 text-sheraton-gold mr-2" />
            <Badge className="bg-sheraton-gold text-sheraton-navy px-4 py-2">
              Digital Menu - Always Fresh
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-sheraton-navy mb-4">
            Sheraton Special Menu
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time availability • Eco-friendly • Skip the queue • Special
            guest priority
          </p>

          {/* Environmental Impact */}
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-green-600">
            <Leaf className="h-4 w-4" />
            <span>
              You're helping save 12 trees per month by using our digital menu!
            </span>
          </div>
        </div>

        {/* Current Special Offer */}
        {currentOffer && (
          <Card className="mb-8 border-sheraton-gold bg-gradient-to-r from-sheraton-gold/10 to-sheraton-gold/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{currentOffer.emoji}</div>
                  <div>
                    <h3 className="text-xl font-bold text-sheraton-navy">
                      {currentOffer.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {currentOffer.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Ends in:</div>
                  <div className="text-2xl font-bold text-sheraton-gold">
                    {Math.floor(
                      (currentOffer.countdown.getTime() -
                        currentTime.getTime()) /
                        (1000 * 60 * 60),
                    )}
                    h{" "}
                    {Math.floor(
                      ((currentOffer.countdown.getTime() -
                        currentTime.getTime()) %
                        (1000 * 60 * 60)) /
                        (1000 * 60),
                    )}
                    m
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters and Categories */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-sheraton-gold" />
                  Find Your Dish
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-sheraton-gold" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "default" : "ghost"
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
              </CardContent>
            </Card>

            {/* Live Kitchen Status */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Zap className="h-5 w-5" />
                  Live Kitchen Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Kitchen Load</span>
                  <span className="text-green-600">Light</span>
                </div>
                <Progress value={35} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  ⚡ Fast service: Orders ready in 15-25 min
                </div>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>All stations operational</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 gap-6">
              {filteredItems.map((item) => {
                const availability = getAvailabilityStatus(item);
                const cartQuantity = cart[item.id] || 0;
                const discountPercent = item.originalPrice > item.price
                  ? Math.round((1 - item.price / item.originalPrice) * 100)
                  : 0;
                const customStatuses = item.statuses || [];
                const statusLabels = availability.status === "out"
                  ? ["Sold out", ...customStatuses.filter((status) => status.toLowerCase() !== "available" && status.toLowerCase() !== "sold out")]
                  : customStatuses.length ? customStatuses : ["Available"];

                return (
                  <Card
                    key={item.id}
                    className={`overflow-hidden hover:shadow-lg transition-shadow ${
                      availability.status === "out" ? "opacity-80" : ""
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Item Image and Basic Info */}
                        <div className="min-w-0 flex-1 p-4 md:p-6">
                          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex min-w-0 items-start gap-3 md:items-center md:gap-4">
                              <div className="shrink-0 text-4xl md:text-5xl" aria-hidden="true">{item.image}</div>
                              <div className="min-w-0">
                                <div className="mb-1 flex flex-wrap items-start gap-2">
                                  <h3 className="break-words text-lg font-bold text-sheraton-navy md:text-xl">
                                    {item.name}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-1.5" aria-label={`${item.name} status`}>
                                    {statusLabels.map((status) => (
                                      <Badge
                                        key={status}
                                        variant={status.toLowerCase() === "sold out" ? "destructive" : "outline"}
                                        className={status.toLowerCase() === "available" ? "border-green-600 text-green-700" : ""}
                                      >
                                        {status}
                                      </Badge>
                                    ))}
                                    {item.trending && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-red-100 text-red-600"
                                      >
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        Trending
                                      </Badge>
                                    )}
                                    {item.special_offer && (
                                      <Badge className="bg-sheraton-gold text-sheraton-navy">
                                        <Gift className="h-3 w-3 mr-1" />
                                        Promotion
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="mb-2 break-words text-sm text-muted-foreground md:text-base">
                                  {item.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {item.cookTime}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Globe className="h-4 w-4" />
                                    {item.origin}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Apple className="h-4 w-4" />
                                    {item.calories} cal
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Price and Availability */}
                            <div className="w-full text-left md:w-auto md:text-right">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                {discountPercent > 0 && (
                                  <span className="text-sm text-muted-foreground line-through" aria-label={`Original price ${formatPrice(item.originalPrice, item.currency)}`}>
                                    {formatPrice(item.originalPrice, item.currency)}
                                  </span>
                                )}
                                <span className="text-2xl font-bold text-sheraton-navy" aria-label={`Current price ${formatPrice(item.price, item.currency)}`}>
                                  {formatPrice(item.price, item.currency)}
                                </span>
                                {discountPercent > 0 && (
                                  <Badge className="bg-red-100 text-red-700">
                                    {discountPercent}% off
                                  </Badge>
                                )}
                              </div>
                              <div
                                className={`text-sm font-medium ${availability.color}`}
                                aria-label={`Availability: ${availability.message}`}
                              >
                                {availability.message}
                              </div>
                              {item.availability > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.availability} left
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Detailed Information */}
                          <div className="mb-4 rounded-lg bg-gray-50 p-3 md:p-4">
                            <p className="mb-2 break-words text-sm text-gray-700">
                              {item.description_full}
                            </p>
                            {item.chef_note && (
                              <div className="flex items-center gap-2 text-xs text-sheraton-gold">
                                <ChefHat className="h-3 w-3" />
                                <span className="break-words italic">{item.chef_note}</span>
                              </div>
                            )}
                          </div>

                          {/* Dish media */}
                          {item.mediaUrl && (
                            <div className="mb-4 flex flex-col items-center gap-2 rounded-lg border border-border/60 bg-white p-3">
                              {item.mediaType === "video" ? (
                                <video
                                  src={item.mediaUrl}
                                  controls
                                  className="aspect-video max-h-56 w-full max-w-xl rounded-md object-contain md:aspect-auto md:max-h-64"
                                  aria-label={`${item.name} video`}
                                />
                              ) : (
                                <img
                                  src={item.mediaUrl}
                                  alt={`${item.name} dish`}
                                  className="max-h-64 w-full max-w-xl rounded-md object-contain"
                                />
                              )}
                              <Badge variant="outline" className="gap-1 text-xs">
                                {item.mediaType === "video" ? "Video" : "Image"}
                              </Badge>
                            </div>
                          )}

                          {/* Tags and Dietary Info */}
                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">
                                {item.popularity}% loved
                              </span>
                            </div>
                            {item.dietary.includes("vegetarian") && (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-600"
                              >
                                <Leaf className="h-3 w-3 mr-1" />
                                Vegetarian
                              </Badge>
                            )}
                            {item.dietary.includes("gluten-free") && (
                              <Badge
                                variant="outline"
                                className="text-blue-600 border-blue-600"
                              >
                                Gluten-Free
                              </Badge>
                            )}
                            {item.spiceLevel > 0 && (
                              <Badge
                                variant="outline"
                                className="text-red-600 border-red-600"
                              >
                                {Array(item.spiceLevel).fill("🌶️").join("")}
                              </Badge>
                            )}
                          </div>

                          {/* Special Offer */}
                          {item.special_offer && (
                            <div className="mb-4 rounded-lg border border-sheraton-gold/30 bg-sheraton-gold/10 p-2 md:p-3">
                              <div className="flex flex-wrap items-center gap-2 font-medium text-sheraton-gold">
                                <Gift className="h-4 w-4" />
                                <span>{item.special_offer}</span>
                              </div>
                            </div>
                          )}

                          {/* Add to Cart */}
                          <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                              {cartQuantity > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">
                                    {cartQuantity}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addToCart(item.id)}
                                    disabled={item.availability === 0}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => addToCart(item.id)}
                                  disabled={item.availability === 0}
                                  className="sheraton-gradient text-white"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add to Order
                                </Button>
                              )}
                            </div>

                            {item.availability === 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-sheraton-gold border-sheraton-gold md:w-auto"
                              >
                                <Bell className="h-4 w-4 mr-2" />
                                Notify When Available
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating Cart */}
        {getTotalItems() > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-50 md:bottom-6 md:left-auto md:right-6">
            <Card className="sheraton-gradient border-0 text-white luxury-shadow">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between gap-2 md:gap-4">
                  <div className="relative">
                    <ShoppingCart className="h-6 w-6" />
                    <Badge className="absolute -top-2 -right-2 bg-white text-sheraton-navy min-w-[20px] h-5 p-0 flex items-center justify-center text-xs">
                      {getTotalItems()}
                    </Badge>
                  </div>
                  <div>
                    <div className="font-semibold">{formatCartTotal()}</div>
                    <div className="text-xs text-white/80">
                      {getTotalItems()} items
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white text-sheraton-navy hover:bg-white/90"
                    onClick={() => setShowCheckoutPage(true)}
                  >
                    Order Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* QR Code Info */}
        <Card className="mt-12 bg-sheraton-navy text-white">
          <CardContent className="p-8 text-center">
            <QrCode className="h-16 w-16 mx-auto mb-4 text-sheraton-gold" />
            <h3 className="text-2xl font-bold mb-4">
              Skip the Wait, Order Like a Boss!
            </h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Scan our table QR codes to instantly access this menu. Order ahead
              and arrive to find your food ready. No more waiting, no more
              explaining dishes to staff - everything is detailed here for you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-semibold">Priority Service</div>
                <div className="text-sm text-white/70">
                  App orders come first
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🌱</div>
                <div className="font-semibold">Eco-Friendly</div>
                <div className="text-sm text-white/70">Zero paper waste</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">👨‍🍳</div>
                <div className="font-semibold">Real-Time Updates</div>
                <div className="text-sm text-white/70">Live availability</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default MenuPage;
