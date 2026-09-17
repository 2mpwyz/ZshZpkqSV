import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Calendar,
  User,
  Star,
  Camera,
  MapPin,
  Award,
  TrendingUp,
  Search,
  Filter,
  Plus,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";

const BlogPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("discover");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  const blogPosts = [
    {
      id: "1",
      title:
        "The Art of Luxury Hospitality: Behind the Scenes at Sheraton Special",
      excerpt:
        "Discover the meticulous attention to detail that makes every guest experience extraordinary...",
      content:
        "From the moment you step into our lobby, every element has been carefully curated to create an atmosphere of refined elegance and warm hospitality...",
      author: {
        name: "Isabella Chen",
        role: "Guest Experience Director",
        avatar: "/staff/isabella.jpg",
      },
      category: "Hospitality",
      readTime: "5 min read",
      publishedAt: "2024-02-10",
      image: "/blog/luxury-hospitality.jpg",
      likes: 127,
      comments: 23,
      views: 1840,
      featured: true,
      tags: ["luxury", "service", "hospitality"],
    },
    {
      id: "2",
      title: "Culinary Journey: Meet Our Award-Winning Executive Chef",
      excerpt:
        "Chef Marcus Rodriguez shares his philosophy on creating unforgettable dining experiences...",
      content:
        "Cooking is not just about combining ingredients; it's about creating memories that last a lifetime...",
      author: {
        name: "Marcus Rodriguez",
        role: "Executive Chef",
        avatar: "/staff/marcus.jpg",
      },
      category: "Culinary",
      readTime: "7 min read",
      publishedAt: "2024-02-08",
      image: "/blog/chef-interview.jpg",
      likes: 89,
      comments: 15,
      views: 956,
      featured: false,
      tags: ["chef", "culinary", "interview"],
    },
    {
      id: "3",
      title: "Guest Spotlight: A Wedding to Remember",
      excerpt:
        "Sarah and David's fairytale wedding at Sheraton Special was nothing short of magical...",
      content:
        "When Sarah and David first visited us for their venue tour, we knew their wedding would be something special...",
      author: {
        name: "Sarah Mitchell",
        role: "Events Coordinator",
        avatar: "/staff/sarah.jpg",
      },
      category: "Events",
      readTime: "4 min read",
      publishedAt: "2024-02-05",
      image: "/blog/wedding-feature.jpg",
      likes: 203,
      comments: 45,
      views: 2150,
      featured: true,
      tags: ["wedding", "events", "guest-story"],
    },
    {
      id: "4",
      title: "Sustainable Luxury: Our Commitment to the Environment",
      excerpt:
        "Learn about our innovative sustainability initiatives that don't compromise on luxury...",
      content:
        "At Sheraton Special, we believe luxury and sustainability go hand in hand...",
      author: {
        name: "Dr. Emily Green",
        role: "Sustainability Director",
        avatar: "/staff/emily.jpg",
      },
      category: "Sustainability",
      readTime: "6 min read",
      publishedAt: "2024-02-03",
      image: "/blog/sustainability.jpg",
      likes: 156,
      comments: 31,
      views: 1420,
      featured: false,
      tags: ["sustainability", "environment", "luxury"],
    },
  ];

  const guestStories = [
    {
      id: "gs1",
      title: "My Unforgettable Anniversary at Sheraton Special",
      content:
        "The staff went above and beyond to make our 25th anniversary celebration perfect. From the rose petals in our suite to the surprise champagne...",
      author: {
        name: "Robert & Linda Thompson",
        location: "New York",
        avatar: "/guests/thompson.jpg",
      },
      rating: 5,
      date: "2024-02-12",
      likes: 67,
      category: "Anniversary",
      images: ["/stories/anniversary1.jpg", "/stories/anniversary2.jpg"],
    },
    {
      id: "gs2",
      title: "Business Trip Turned into a Wellness Retreat",
      content:
        "What started as a routine business trip became an incredible wellness experience. The spa treatments and healthy dining options...",
      author: {
        name: "Jennifer Kim",
        location: "San Francisco",
        avatar: "/guests/jennifer.jpg",
      },
      rating: 5,
      date: "2024-02-10",
      likes: 43,
      category: "Business & Wellness",
      images: ["/stories/business-wellness.jpg"],
    },
  ];

  const staffInsights = [
    {
      id: "si1",
      title: "A Day in the Life: Housekeeping Excellence",
      content:
        "Every room tells a story, and it's our job to ensure that story begins with perfection. Here's how we maintain our exceptional standards...",
      author: {
        name: "Maria Santos",
        role: "Head of Housekeeping",
        avatar: "/staff/maria.jpg",
      },
      category: "Behind the Scenes",
      readTime: "3 min read",
      date: "2024-02-11",
      likes: 85,
    },
    {
      id: "si2",
      title: "The Concierge's Guide to Hidden Local Gems",
      content:
        "After 10 years as a concierge, I've discovered the most amazing local spots that most tourists never find...",
      author: {
        name: "Thomas Wilson",
        role: "Chief Concierge",
        avatar: "/staff/thomas.jpg",
      },
      category: "Local Insights",
      readTime: "8 min read",
      date: "2024-02-09",
      likes: 124,
    },
  ];

  const trendingTopics = [
    { tag: "luxury-hospitality", posts: 45 },
    { tag: "guest-experiences", posts: 38 },
    { tag: "culinary-excellence", posts: 29 },
    { tag: "sustainability", posts: 22 },
    { tag: "wellness", posts: 19 },
  ];

  const handleLike = (postId: string) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
  };

  const handleSave = (postId: string) => {
    const newSavedPosts = new Set(savedPosts);
    if (newSavedPosts.has(postId)) {
      newSavedPosts.delete(postId);
    } else {
      newSavedPosts.add(postId);
    }
    setSavedPosts(newSavedPosts);
  };

  const renderDiscover = () => (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search stories and insights..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <select className="px-3 py-2 border rounded-md">
            <option value="all">All Categories</option>
            <option value="hospitality">Hospitality</option>
            <option value="culinary">Culinary</option>
            <option value="events">Events</option>
            <option value="sustainability">Sustainability</option>
          </select>
        </div>
      </div>

      {/* Featured Posts */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-sheraton-navy flex items-center">
          <Star className="h-5 w-5 mr-2 text-sheraton-gold" />
          Featured Stories
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {blogPosts
            .filter((post) => post.featured)
            .map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-sheraton-cream to-sheraton-pearl flex items-center justify-center">
                  <Camera className="h-16 w-16 text-sheraton-gold" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{post.category}</Badge>
                    <span className="text-sm text-gray-500">
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>
                          {post.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {post.author.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.author.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                          likedPosts.has(post.id) ? "text-red-500" : ""
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            likedPosts.has(post.id) ? "fill-current" : ""
                          }`}
                        />
                        <span>{post.likes}</span>
                      </button>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </div>
                      <button
                        onClick={() => handleSave(post.id)}
                        className={`hover:text-sheraton-gold transition-colors ${
                          savedPosts.has(post.id) ? "text-sheraton-gold" : ""
                        }`}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            savedPosts.has(post.id) ? "fill-current" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </div>

      {/* All Stories */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-sheraton-navy">
          Latest Stories
        </h3>
        <div className="space-y-4">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-32 h-24 bg-gradient-to-br from-sheraton-cream to-sheraton-pearl rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera className="h-8 w-8 text-sheraton-gold" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{post.category}</Badge>
                    <span className="text-sm text-gray-500">
                      {post.readTime}
                    </span>
                    <span className="text-sm text-gray-500">
                      • {post.publishedAt}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-sheraton-navy mb-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>
                          {post.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {post.author.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.views}</span>
                      </div>
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                          likedPosts.has(post.id) ? "text-red-500" : ""
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            likedPosts.has(post.id) ? "fill-current" : ""
                          }`}
                        />
                        <span>{post.likes}</span>
                      </button>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGuestStories = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-sheraton-navy">
          Guest Stories
        </h3>
        <Button className="bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy">
          <Plus className="h-4 w-4 mr-2" />
          Share Your Story
        </Button>
      </div>

      <div className="grid gap-6">
        {guestStories.map((story) => (
          <div
            key={story.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={story.author.avatar} />
                <AvatarFallback>
                  {story.author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sheraton-navy">
                      {story.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{story.author.name}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {story.author.location}
                      </div>
                      <span>•</span>
                      <span>{story.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-500 fill-current"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{story.content}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{story.category}</Badge>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>{story.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-sheraton-navy transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>Reply</span>
                    </button>
                    <button className="hover:text-sheraton-navy transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStaffInsights = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-sheraton-navy">
        Staff Insights & Behind the Scenes
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {staffInsights.map((insight) => (
          <div
            key={insight.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <Badge variant="outline" className="mb-3">
              {insight.category}
            </Badge>
            <h4 className="font-semibold text-sheraton-navy mb-2">
              {insight.title}
            </h4>
            <p className="text-gray-600 text-sm mb-4">{insight.content}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={insight.author.avatar} />
                  <AvatarFallback>
                    {insight.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{insight.author.name}</p>
                  <p className="text-xs text-gray-500">{insight.author.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{insight.readTime}</span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{insight.likes}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrending = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-sheraton-navy flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-sheraton-gold" />
        Trending Topics
      </h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingTopics.map((topic, index) => (
          <div
            key={topic.tag}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-sheraton-navy">
                #{topic.tag}
              </span>
              <Badge variant="secondary">{topic.posts} posts</Badge>
            </div>
            <div className="text-sm text-gray-600">
              Trending in hospitality community
            </div>
          </div>
        ))}
      </div>

      {/* Community Guidelines */}
      <div className="bg-sheraton-cream rounded-lg p-6">
        <h4 className="font-semibold text-sheraton-navy mb-3">
          Community Guidelines
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Share authentic experiences and honest feedback</li>
          <li>• Respect privacy and confidentiality of other guests</li>
          <li>• Use constructive language and be kind to our team</li>
          <li>• Report inappropriate content to our moderation team</li>
          <li>• Celebrate the special moments that make Sheraton unique</li>
        </ul>
      </div>
    </div>
  );

  const tabs = [
    { id: "discover", label: "Discover", content: renderDiscover },
    {
      id: "guest-stories",
      label: "Guest Stories",
      content: renderGuestStories,
    },
    {
      id: "staff-insights",
      label: "Staff Insights",
      content: renderStaffInsights,
    },
    { id: "trending", label: "Trending", content: renderTrending },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sheraton-cream via-white to-sheraton-pearl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sheraton-navy mb-4">
            Special Stories & Community
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover inspiring stories, share your experiences, and connect with
            our community of guests and hospitality professionals.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 rounded-md font-medium transition-colors whitespace-nowrap ${
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
    </div>
  );
};

export default BlogPage;
