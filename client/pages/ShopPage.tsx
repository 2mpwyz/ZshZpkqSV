import React, { useState } from "react";
import {
  ShoppingCart,
  Heart,
  Star,
  Filter,
  Search,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  Package,
  Gift,
  Crown,
  Coffee,
  Shirt,
  Home,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import ShopCheckoutModal from "../components/shop/ShopCheckoutModal";

const ShopPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [showCheckout, setShowCheckout] = useState(false);

  const categories = [
    { id: "all", label: "All Products", icon: Package },
    { id: "amenities", label: "Luxury Amenities", icon: Crown },
    { id: "food", label: "Gourmet Food", icon: Coffee },
    { id: "apparel", label: "Sheraton Apparel", icon: Shirt },
    { id: "home", label: "Home Collection", icon: Home },
    { id: "gifts", label: "Gift Sets", icon: Gift },
  ];

  const products = [
    {
      id: "1",
      name: "Sheraton Special Signature Candle",
      description:
        "Hand-poured luxury candle with our signature scent blend of bergamot, vanilla, and sandalwood",
      price: 65,
      originalPrice: 85,
      category: "amenities",
      image: "/shop/signature-candle.jpg",
      rating: 4.8,
      reviews: 124,
      inStock: true,
      bestseller: true,
      tags: ["luxury", "signature", "aromatherapy"],
    },
    {
      id: "2",
      name: "Premium Egyptian Cotton Towel Set",
      description:
        "Ultra-soft 800 GSM Egyptian cotton towels, same quality used in our suites",
      price: 180,
      originalPrice: 240,
      category: "amenities",
      image: "/shop/towel-set.jpg",
      rating: 4.9,
      reviews: 89,
      inStock: true,
      bestseller: false,
      tags: ["cotton", "luxury", "bathroom"],
    },
    {
      id: "3",
      name: "Executive Chef's Signature Coffee Blend",
      description:
        "Artisanal coffee blend exclusively roasted for Sheraton Special",
      price: 28,
      originalPrice: null,
      category: "food",
      image: "/shop/coffee-blend.jpg",
      rating: 4.7,
      reviews: 156,
      inStock: true,
      bestseller: true,
      tags: ["coffee", "gourmet", "signature"],
    },
    {
      id: "4",
      name: "Sheraton Gold Collection Polo Shirt",
      description:
        "Premium polo shirt with subtle Sheraton branding, made from organic cotton",
      price: 95,
      originalPrice: 120,
      category: "apparel",
      image: "/shop/polo-shirt.jpg",
      rating: 4.6,
      reviews: 73,
      inStock: true,
      bestseller: false,
      tags: ["apparel", "organic", "polo"],
    },
    {
      id: "5",
      name: "Luxury Spa Experience Gift Set",
      description:
        "Complete spa experience with body oils, bath salts, and aromatherapy essentials",
      price: 145,
      originalPrice: 195,
      category: "gifts",
      image: "/shop/spa-gift-set.jpg",
      rating: 4.9,
      reviews: 92,
      inStock: true,
      bestseller: true,
      tags: ["spa", "gift", "wellness"],
    },
    {
      id: "6",
      name: "Artisanal Chocolate Collection",
      description:
        "Hand-crafted chocolates featuring exotic flavors from around the world",
      price: 48,
      originalPrice: null,
      category: "food",
      image: "/shop/chocolate-collection.jpg",
      rating: 4.8,
      reviews: 117,
      inStock: false,
      bestseller: false,
      tags: ["chocolate", "artisanal", "gourmet"],
    },
    {
      id: "7",
      name: "Sheraton Home Throw Blanket",
      description:
        "Cashmere blend throw blanket perfect for luxury comfort at home",
      price: 220,
      originalPrice: 280,
      category: "home",
      image: "/shop/throw-blanket.jpg",
      rating: 4.7,
      reviews: 45,
      inStock: true,
      bestseller: false,
      tags: ["cashmere", "home", "comfort"],
    },
    {
      id: "8",
      name: "Limited Edition Anniversary Wine",
      description:
        "Commemorative wine bottle celebrating Sheraton Special's heritage",
      price: 125,
      originalPrice: null,
      category: "food",
      image: "/shop/anniversary-wine.jpg",
      rating: 4.9,
      reviews: 28,
      inStock: true,
      bestseller: false,
      tags: ["wine", "limited", "anniversary"],
    },
  ];

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((product) => product.category === activeCategory);

  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const updateCart = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartCompletely(productId);
    } else {
      setCart((prev) => ({
        ...prev,
        [productId]: quantity,
      }));
    }
  };

  const removeFromCartCompletely = (productId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const toggleWishlist = (productId: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, count) => total + count, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [productId, count]) => {
      const product = products.find((p) => p.id === productId);
      return total + (product?.price || 0) * count;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sheraton-cream via-white to-sheraton-pearl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sheraton-navy mb-4">
            Sheraton Special Collection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Take home the luxury experience with our curated collection of
            premium amenities, gourmet foods, and exclusive merchandise.
          </p>
        </div>

        {/* Shopping Cart Summary */}
        {getTotalItems() > 0 && (
          <div className="bg-sheraton-gold/10 border border-sheraton-gold rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-sheraton-navy" />
                <span className="font-medium text-sheraton-navy">
                  {getTotalItems()} items in cart
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-sheraton-navy">
                  ${getTotalPrice().toFixed(2)}
                </span>
                <Button
                  className="bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
                  onClick={() => setShowCheckout(true)}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search products..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Category Navigation */}
        <div className="flex overflow-x-auto space-x-2 mb-8 pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? "bg-sheraton-gold text-sheraton-navy shadow-sm"
                  : "bg-white text-gray-600 hover:text-sheraton-navy hover:bg-gray-50"
              }`}
            >
              <category.icon className="h-4 w-4" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-br from-sheraton-cream to-sheraton-pearl flex items-center justify-center">
                <Package className="h-16 w-16 text-sheraton-gold" />
                {product.bestseller && (
                  <Badge className="absolute top-2 left-2 bg-sheraton-gold text-sheraton-navy">
                    Bestseller
                  </Badge>
                )}
                {!product.inStock && (
                  <Badge variant="secondary" className="absolute top-2 right-2">
                    Out of Stock
                  </Badge>
                )}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      wishlist.has(product.id)
                        ? "text-red-500 fill-current"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-sheraton-navy mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-lg font-semibold text-sheraton-navy">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Add to Cart */}
                <div className="flex items-center space-x-2">
                  {cart[product.id] ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCart(product.id, cart[product.id] - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="px-3 py-1 bg-gray-100 rounded">
                        {cart[product.id]}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCart(product.id, cart[product.id] + 1)}
                        disabled={!product.inStock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
                      onClick={() => addToCart(product.id)}
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {product.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-sheraton-navy mb-6 text-center">
            Why Shop with Sheraton Special?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-sheraton-cream rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="h-6 w-6 text-sheraton-navy" />
              </div>
              <h4 className="font-semibold text-sheraton-navy mb-2">
                Free Shipping
              </h4>
              <p className="text-sm text-gray-600">
                Complimentary shipping on orders over $100
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-sheraton-cream rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-sheraton-navy" />
              </div>
              <h4 className="font-semibold text-sheraton-navy mb-2">
                Quality Guarantee
              </h4>
              <p className="text-sm text-gray-600">
                Premium quality backed by our satisfaction guarantee
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-sheraton-cream rounded-full flex items-center justify-center mx-auto mb-3">
                <RotateCcw className="h-6 w-6 text-sheraton-navy" />
              </div>
              <h4 className="font-semibold text-sheraton-navy mb-2">
                Easy Returns
              </h4>
              <p className="text-sm text-gray-600">
                30-day return policy for your peace of mind
              </p>
            </div>
          </div>
        </div>
      </div>

      <ShopCheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        products={products}
        onUpdateCart={updateCart}
        onRemoveFromCart={removeFromCartCompletely}
        onClearCart={clearCart}
      />
    </div>
  );
};

export default ShopPage;
