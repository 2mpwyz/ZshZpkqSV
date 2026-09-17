import React, { useState } from "react";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Camera,
  MapPin,
  Calendar,
  User,
  Award,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Heart,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import FeedbackSystem from "../components/feedback/FeedbackSystem";

const ReviewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("all-reviews");
  const [showFeedback, setShowFeedback] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [filterRating, setFilterRating] = useState("all");

  const reviews = [
    {
      id: "1",
      author: {
        name: "Sarah Johnson",
        location: "New York, NY",
        avatar: "/guests/sarah-j.jpg",
        verified: true,
        loyaltyLevel: "Platinum Special",
      },
      rating: 5,
      title: "Absolutely Exceptional Experience",
      content:
        "My stay at Sheraton Special exceeded every expectation. From the moment I arrived, the staff treated me like royalty. The Gold Special member benefits were immediately evident - priority check-in, room upgrade to a stunning suite with city views, and personalized welcome amenities. The concierge, James, went above and beyond to arrange dinner reservations at an exclusive restaurant that wasn't even taking bookings. The attention to detail is remarkable - they remembered my coffee preference from my previous stay six months ago! The spa treatment was transformative, and the housekeeping team maintained impeccable standards. This is true luxury hospitality at its finest.",
      date: "2024-02-15",
      stayType: "Business Trip",
      roomType: "Presidential Suite",
      photos: ["/reviews/presidential-suite.jpg", "/reviews/city-view.jpg"],
      likes: 47,
      helpful: 23,
      verified: true,
      response: {
        author: "Hotel Management",
        content:
          "Dear Sarah, Thank you for this wonderful review! We're thrilled that James and our entire team could make your stay so special. Your loyalty means everything to us, and we look forward to welcoming you back soon.",
        date: "2024-02-16",
      },
    },
    {
      id: "2",
      author: {
        name: "Michael Chen",
        location: "San Francisco, CA",
        avatar: "/guests/michael-c.jpg",
        verified: true,
        loyaltyLevel: "Gold Special",
      },
      rating: 5,
      title: "Perfect Anniversary Celebration",
      content:
        "Sheraton Special made our 10th anniversary unforgettable. The staff coordinated a surprise suite upgrade with rose petals, champagne, and a personalized note. The romance package included couples spa treatments and a private dinner on the terrace overlooking the gardens. Every detail was thoughtfully planned and flawlessly executed. The restaurant's chef even accommodated my wife's gluten-free requirements with a custom tasting menu that was absolutely divine. We felt truly special throughout our entire stay.",
      date: "2024-02-12",
      stayType: "Anniversary",
      roomType: "Garden Villa",
      photos: ["/reviews/anniversary-setup.jpg"],
      likes: 34,
      helpful: 18,
      verified: true,
    },
    {
      id: "3",
      author: {
        name: "Emma Rodriguez",
        location: "Los Angeles, CA",
        avatar: "/guests/emma-r.jpg",
        verified: true,
        loyaltyLevel: "Gold Special",
      },
      rating: 4,
      title: "Outstanding Service with Minor Room Issues",
      content:
        "The service at Sheraton Special is truly world-class. Every staff member I encountered was professional, friendly, and genuinely seemed to care about my experience. The concierge helped me plan an amazing day exploring local attractions, and the restaurant recommendations were spot-on. However, I did experience some issues with the air conditioning in my room, which took a few hours to resolve. Once fixed, everything was perfect. The spa facilities are gorgeous, and the breakfast buffet has an incredible variety of fresh, high-quality options.",
      date: "2024-02-10",
      stayType: "Leisure",
      roomType: "Deluxe Suite",
      photos: [],
      likes: 29,
      helpful: 15,
      verified: true,
      response: {
        author: "Guest Relations Manager",
        content:
          "Dear Emma, Thank you for your detailed feedback. We sincerely apologize for the air conditioning issue and appreciate your patience. We've addressed this with our maintenance team to prevent future occurrences. We're delighted you enjoyed our concierge services and dining options!",
        date: "2024-02-11",
      },
    },
    {
      id: "4",
      author: {
        name: "Robert Williams",
        location: "Chicago, IL",
        avatar: "/guests/robert-w.jpg",
        verified: true,
        loyaltyLevel: "Platinum Special",
      },
      rating: 5,
      title: "Business Trip Excellence",
      content:
        "As a frequent business traveler, I can confidently say Sheraton Special sets the gold standard. The business center is fully equipped, the Wi-Fi is lightning fast throughout the property, and the executive lounge provides a perfect quiet space for work. The staff understands the needs of business guests - early breakfast, efficient service, and seamless check-in/out. The location is also ideal for my meetings downtown. This has become my go-to hotel for all business trips to the city.",
      date: "2024-02-08",
      stayType: "Business Trip",
      roomType: "Executive Suite",
      photos: ["/reviews/business-center.jpg"],
      likes: 22,
      helpful: 31,
      verified: true,
    },
    {
      id: "5",
      author: {
        name: "Lisa Thompson",
        location: "Miami, FL",
        avatar: "/guests/lisa-t.jpg",
        verified: false,
        loyaltyLevel: "Silver Special",
      },
      rating: 3,
      title: "Good Hotel but Overpriced",
      content:
        "The hotel is nice and the staff is friendly, but I feel like it's overpriced for what you get. The room was clean and comfortable, but not extraordinary. The restaurant food was good but expensive. The spa treatments were relaxing but again, quite pricey. For the same money, I've stayed at places that offered more amenities and better value. That said, the location is excellent and the service is professional.",
      date: "2024-02-05",
      stayType: "Leisure",
      roomType: "Standard Room",
      photos: [],
      likes: 8,
      helpful: 12,
      verified: false,
    },
  ];

  const stats = {
    totalReviews: 1247,
    averageRating: 4.7,
    ratingDistribution: {
      5: 68,
      4: 22,
      3: 7,
      2: 2,
      1: 1,
    },
    recommendationRate: 94,
  };

  const categories = [
    { name: "Service", rating: 4.9, count: 1089 },
    { name: "Cleanliness", rating: 4.8, count: 1156 },
    { name: "Location", rating: 4.6, count: 987 },
    { name: "Value", rating: 4.3, count: 892 },
    { name: "Amenities", rating: 4.7, count: 1034 },
  ];

  const filteredReviews = reviews.filter((review) => {
    if (filterRating === "all") return true;
    return review.rating === parseInt(filterRating);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "rating-high":
        return b.rating - a.rating;
      case "rating-low":
        return a.rating - b.rating;
      case "helpful":
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  const renderRatingStars = (rating: number, showNumber: boolean = true) => (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-gray-700">{rating}</span>
      )}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Overall Rating */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-sheraton-navy mb-2">
              {stats.averageRating}
            </div>
            <div className="flex justify-center mb-2">
              {renderRatingStars(Math.round(stats.averageRating), false)}
            </div>
            <div className="text-gray-600">
              Based on {stats.totalReviews.toLocaleString()} reviews
            </div>
            <div className="mt-4">
              <div className="text-2xl font-semibold text-green-600">
                {stats.recommendationRate}%
              </div>
              <div className="text-sm text-gray-600">of guests recommend</div>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(stats.ratingDistribution)
              .reverse()
              .map(([rating, percentage]) => (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm w-8">{rating}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sheraton-gold"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-10">
                    {percentage}%
                  </span>
                </div>
              ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sheraton-navy">
              Review Categories
            </h4>
            {categories.map((category) => (
              <div key={category.name} className="flex justify-between">
                <span className="text-sm text-gray-700">{category.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= category.rating
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {category.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write Review CTA */}
      <div className="bg-gradient-to-r from-sheraton-gold/10 to-sheraton-navy/10 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-sheraton-navy mb-2">
              Share Your Experience
            </h3>
            <p className="text-gray-600">
              Help other guests by sharing your honest feedback about your stay
            </p>
          </div>
          <Button
            onClick={() => setShowFeedback(true)}
            className="bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
          >
            <Plus className="h-4 w-4 mr-2" />
            Write Review
          </Button>
        </div>
      </div>
    </div>
  );

  const renderAllReviews = () => (
    <div className="space-y-6">
      {/* Filters and Sort */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search reviews..." className="pl-10 w-64" />
            </div>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="recent">Most Recent</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={review.author.avatar} />
                  <AvatarFallback>
                    {review.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sheraton-navy">
                      {review.author.name}
                    </span>
                    {review.verified && (
                      <Badge variant="outline" className="text-xs">
                        Verified Guest
                      </Badge>
                    )}
                    <Badge className="bg-sheraton-gold text-sheraton-navy text-xs">
                      {review.author.loyaltyLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{review.author.location}</span>
                    <span>•</span>
                    <Calendar className="h-3 w-3" />
                    <span>{review.date}</span>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            {/* Rating and Title */}
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-2">
                {renderRatingStars(review.rating)}
                <span className="text-sm text-gray-600">•</span>
                <span className="text-sm text-gray-600">{review.stayType}</span>
                <span className="text-sm text-gray-600">•</span>
                <span className="text-sm text-gray-600">{review.roomType}</span>
              </div>
              <h3 className="text-lg font-semibold text-sheraton-navy">
                {review.title}
              </h3>
            </div>

            {/* Review Content */}
            <p className="text-gray-700 mb-4 leading-relaxed">
              {review.content}
            </p>

            {/* Photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="flex space-x-2 mb-4">
                {review.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center"
                  >
                    <Camera className="h-6 w-6 text-gray-400" />
                  </div>
                ))}
              </div>
            )}

            {/* Review Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <button className="flex items-center space-x-1 hover:text-sheraton-navy transition-colors">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Helpful ({review.helpful})</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-sheraton-navy transition-colors">
                  <Heart className="h-4 w-4" />
                  <span>Like ({review.likes})</span>
                </button>
                <button className="flex items-center space-x-1 hover:text-sheraton-navy transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
              <button className="text-sheraton-navy hover:underline text-sm">
                Report
              </button>
            </div>

            {/* Hotel Response */}
            {review.response && (
              <div className="mt-4 bg-sheraton-cream rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="h-4 w-4 text-sheraton-gold" />
                  <span className="font-medium text-sheraton-navy">
                    {review.response.author}
                  </span>
                  <span className="text-sm text-gray-600">
                    • {review.response.date}
                  </span>
                </div>
                <p className="text-gray-700">{review.response.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" className="w-48">
          Load More Reviews
        </Button>
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", content: renderOverview },
    { id: "all-reviews", label: "All Reviews", content: renderAllReviews },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sheraton-cream via-white to-sheraton-pearl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sheraton-navy mb-4">
            Guest Reviews & Feedback
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Read authentic reviews from our valued guests and share your own
            experience to help others discover what makes Sheraton Special truly
            special.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-sheraton-gold text-sheraton-navy shadow-sm"
                    : "text-gray-600 hover:text-sheraton-navy"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>{tabs.find((tab) => tab.id === activeTab)?.content()}</div>
      </div>

      {/* Feedback Modal */}
      <FeedbackSystem
        section="Overall Experience"
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </div>
  );
};

export default ReviewsPage;
