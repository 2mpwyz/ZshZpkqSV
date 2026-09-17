import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Star,
  Award,
  CreditCard,
  Search,
  Filter,
  Plus,
  Share2,
  Heart,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import EventCheckoutModal from "../components/events/EventCheckoutModal";

const EventsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventCart, setEventCart] = useState<{ [key: string]: number }>({});
  const [showCheckout, setShowCheckout] = useState(false);

  const upcomingEvents = [
    {
      id: "1",
      title: "Sheraton Special Wine Tasting",
      description:
        "An exclusive wine tasting experience featuring rare vintages from our premium collection",
      date: "2024-02-15",
      time: "7:00 PM",
      location: "Sky Lounge",
      price: 125,
      capacity: 25,
      attending: 18,
      category: "Fine Dining",
      image: "wine-tasting.jpg",
      featured: true,
      rating: 4.9,
      host: "Sommelier Marcus Chen",
    },
    {
      id: "2",
      title: "Valentine's Romantic Dinner",
      description:
        "Intimate candlelit dinner with live jazz music and personalized service",
      date: "2024-02-14",
      time: "6:30 PM",
      location: "Garden Terrace",
      price: 200,
      capacity: 20,
      attending: 15,
      category: "Romance",
      image: "romantic-dinner.jpg",
      featured: true,
      rating: 4.8,
      host: "Chef Isabella Rose",
    },
    {
      id: "3",
      title: "Business Networking Breakfast",
      description:
        "Connect with fellow professionals in a sophisticated setting",
      date: "2024-02-20",
      time: "7:30 AM",
      location: "Executive Lounge",
      price: 45,
      capacity: 50,
      attending: 32,
      category: "Business",
      image: "networking.jpg",
      featured: false,
      rating: 4.6,
      host: "Sheraton Business Center",
    },
    {
      id: "4",
      title: "Spa & Wellness Workshop",
      description:
        "Learn mindfulness techniques and enjoy rejuvenating treatments",
      date: "2024-02-25",
      time: "10:00 AM",
      location: "Serenity Spa",
      price: 85,
      capacity: 15,
      attending: 12,
      category: "Wellness",
      image: "spa-workshop.jpg",
      featured: false,
      rating: 4.7,
      host: "Dr. Sarah Wellness",
    },
  ];

  const eventCategories = [
    "All",
    "Fine Dining",
    "Romance",
    "Business",
    "Wellness",
    "Entertainment",
    "Seasonal",
  ];

  const myEvents = [
    {
      id: "1",
      title: "Valentine's Romantic Dinner",
      status: "confirmed",
      date: "2024-02-14",
    },
    {
      id: "3",
      title: "Business Networking Breakfast",
      status: "pending",
      date: "2024-02-20",
    },
  ];

  const planningTools = [
    {
      title: "Budget Calculator",
      description: "Plan your event budget with our interactive tool",
      icon: CreditCard,
      action: "Calculate",
    },
    {
      title: "Vendor Directory",
      description: "Find trusted local vendors and service providers",
      icon: Users,
      action: "Browse",
    },
    {
      title: "Timeline Planner",
      description: "Create detailed event timelines and schedules",
      icon: Clock,
      action: "Plan",
    },
    {
      title: "Guest Manager",
      description: "Manage invitations and RSVPs efficiently",
      icon: Users,
      action: "Manage",
    },
  ];

  const addToEventCart = (eventId: string) => {
    setEventCart((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] || 0) + 1,
    }));
  };

  const updateEventCart = (eventId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromEventCart(eventId);
    } else {
      setEventCart((prev) => ({
        ...prev,
        [eventId]: quantity,
      }));
    }
  };

  const removeFromEventCart = (eventId: string) => {
    setEventCart((prev) => {
      const newCart = { ...prev };
      delete newCart[eventId];
      return newCart;
    });
  };

  const clearEventCart = () => {
    setEventCart({});
  };

  const getTotalEventItems = () => {
    return Object.values(eventCart).reduce((total, count) => total + count, 0);
  };

  const renderBrowseEvents = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search events..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <select className="px-3 py-2 border rounded-md">
            {eventCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Events */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-sheraton-navy">
          Featured Events
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {upcomingEvents
            .filter((event) => event.featured)
            .map((event) => (
              <div
                key={event.id}
                className="relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-sheraton-gold text-sheraton-navy">
                    Featured
                  </Badge>
                </div>
                <div className="h-48 bg-gradient-to-br from-sheraton-cream to-sheraton-pearl flex items-center justify-center">
                  <Award className="h-16 w-16 text-sheraton-gold" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">
                      {event.rating}
                    </span>
                    <span className="text-sm text-gray-400">
                      • {event.host}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sheraton-navy mb-2">
                    {event.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    {event.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.date} at {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {event.attending}/{event.capacity} attending
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-sheraton-navy">
                      ${event.price}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button
                        className="bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy"
                        onClick={() => addToEventCart(event.id)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* All Events */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-sheraton-navy">
          All Events
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <Badge variant="outline" className="mb-2">
                {event.category}
              </Badge>
              <h4 className="font-semibold text-sheraton-navy mb-2">
                {event.title}
              </h4>
              <div className="space-y-1 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-3 w-3 mr-2" />
                  {event.date}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-3 w-3 mr-2" />
                  {event.location}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sheraton-navy">
                  ${event.price}
                </span>
                <Button size="sm" variant="outline">
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMyEvents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-sheraton-navy">My Events</h3>
        <Button className="bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {myEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-sheraton-navy">
                {event.title}
              </h4>
              <Badge
                variant={event.status === "confirmed" ? "default" : "secondary"}
              >
                {event.status}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Calendar className="h-4 w-4 mr-2" />
              {event.date}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="sm">View Details</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlanning = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-sheraton-navy mb-2">
          Event Planning Tools
        </h3>
        <p className="text-gray-600">
          Professional tools to help you plan the perfect event
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {planningTools.map((tool, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-sheraton-cream rounded-lg mr-4">
                <tool.icon className="h-6 w-6 text-sheraton-navy" />
              </div>
              <div>
                <h4 className="font-semibold text-sheraton-navy">
                  {tool.title}
                </h4>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </div>
            </div>
            <Button className="w-full bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy">
              {tool.action}
            </Button>
          </div>
        ))}
      </div>

      {/* Event Creation Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-sheraton-navy mb-4">
          Quick Event Creation
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Event Title
            </label>
            <Input placeholder="Enter event name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Event Date</label>
            <Input type="date" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <Input placeholder="Event location" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Expected Guests
            </label>
            <Input type="number" placeholder="Number of guests" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Event Description
            </label>
            <Textarea placeholder="Describe your event" />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Private Event</span>
              <Switch />
            </div>
          </div>
        </div>
        <Button className="w-full mt-4 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy">
          Create Event Proposal
        </Button>
      </div>
    </div>
  );

  const tabs = [
    { id: "browse", label: "Browse Events", content: renderBrowseEvents },
    { id: "my-events", label: "My Events", content: renderMyEvents },
    { id: "planning", label: "Event Planning", content: renderPlanning },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sheraton-cream via-white to-sheraton-pearl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sheraton-navy mb-4">
            Special Events & Experiences
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover exclusive events, create memorable experiences, and connect
            with fellow guests in our curated collection of special occasions.
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

        {/* Floating Event Cart Summary */}
        {getTotalEventItems() > 0 && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-sheraton-gold text-sheraton-navy rounded-lg shadow-lg p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Calendar className="h-6 w-6" />
                  <Badge className="absolute -top-2 -right-2 bg-sheraton-navy text-sheraton-gold min-w-[20px] h-5 p-0 flex items-center justify-center text-xs">
                    {getTotalEventItems()}
                  </Badge>
                </div>
                <div>
                  <div className="font-semibold">
                    {getTotalEventItems()} {getTotalEventItems() === 1 ? 'Event' : 'Events'}
                  </div>
                  <div className="text-xs opacity-80">Ready to book</div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-sheraton-navy text-sheraton-gold hover:bg-sheraton-navy/90"
                  onClick={() => setShowCheckout(true)}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        )}

        <EventCheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          cart={eventCart}
          events={upcomingEvents}
          onUpdateCart={updateEventCart}
          onRemoveFromCart={removeFromEventCart}
          onClearCart={clearEventCart}
        />
      </div>
    </div>
  );
};

export default EventsPage;
