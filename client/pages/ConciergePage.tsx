import React, { useState } from "react";
import {
  Crown,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  Car,
  Plane,
  Utensils,
  ShoppingBag,
  Camera,
  Music,
  Users,
  Clock,
  Star,
  Send,
  Check,
  Heart,
  Gift,
  Briefcase,
  Baby,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";

const ConciergePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("services");
  const [chatMessage, setChatMessage] = useState("");
  const [requestForm, setRequestForm] = useState({
    type: "",
    title: "",
    description: "",
    date: "",
    time: "",
    guests: 1,
    budget: "",
    preferences: "",
  });

  const conciergeTeam = [
    {
      id: "1",
      name: "James Wellington",
      title: "Chief Concierge",
      specialties: ["Fine Dining", "VIP Events", "Luxury Shopping"],
      languages: ["English", "French", "Italian"],
      avatar: "/staff/james.jpg",
      experience: "15+ years",
      certifications: ["Les Clefs d'Or", "Luxury Travel Specialist"],
      rating: 4.9,
      description:
        "James has been curating exceptional experiences for our most discerning guests for over 15 years. His extensive network and attention to detail ensure every request is fulfilled beyond expectations.",
    },
    {
      id: "2",
      name: "Sofia Martinez",
      title: "Senior Concierge",
      specialties: ["Cultural Experiences", "Family Activities", "Wellness"],
      languages: ["English", "Spanish", "Portuguese"],
      avatar: "/staff/sofia.jpg",
      experience: "10+ years",
      certifications: ["Cultural Tourism Specialist", "Family Travel Expert"],
      rating: 4.8,
      description:
        "Sofia's passion for local culture and family-friendly experiences makes her the perfect guide for creating memorable moments for guests of all ages.",
    },
    {
      id: "3",
      name: "David Chen",
      title: "Business Concierge",
      specialties: ["Corporate Events", "Business Services", "Transportation"],
      languages: ["English", "Mandarin", "Cantonese"],
      avatar: "/staff/david.jpg",
      experience: "8+ years",
      certifications: ["Business Travel Specialist", "Event Planning"],
      rating: 4.9,
      description:
        "David specializes in seamless business travel arrangements and corporate event coordination, ensuring our business guests can focus on what matters most.",
    },
  ];

  const serviceCategories = [
    {
      id: "dining",
      title: "Dining & Reservations",
      icon: Utensils,
      description: "Exclusive restaurant reservations and culinary experiences",
      services: [
        "Priority reservations at Michelin-starred restaurants",
        "Private chef arrangements",
        "Wine cellar tours and tastings",
        "Culinary classes and food tours",
        "Special dietary accommodation assistance",
      ],
      popular: true,
    },
    {
      id: "transportation",
      title: "Transportation",
      icon: Car,
      description: "Luxury transportation and travel arrangements",
      services: [
        "Private chauffeur services",
        "Airport transfers in luxury vehicles",
        "Helicopter and private jet charters",
        "Yacht and boat rentals",
        "Vintage car rentals for special occasions",
      ],
      popular: true,
    },
    {
      id: "entertainment",
      title: "Entertainment & Events",
      icon: Music,
      description: "Exclusive access to shows, events, and experiences",
      services: [
        "VIP tickets to sold-out shows and concerts",
        "Private museum tours and cultural experiences",
        "Sports event premium seating",
        "Theater and opera reservations",
        "Celebrity meet-and-greet arrangements",
      ],
      popular: false,
    },
    {
      id: "shopping",
      title: "Personal Shopping",
      icon: ShoppingBag,
      description: "Curated shopping experiences and personal services",
      services: [
        "Personal shopping with style consultants",
        "Exclusive boutique access and private showings",
        "Luxury brand concierge services",
        "Gift sourcing and wrapping",
        "Fashion event invitations",
      ],
      popular: false,
    },
    {
      id: "wellness",
      title: "Wellness & Spa",
      icon: Heart,
      description: "Rejuvenating wellness experiences and health services",
      services: [
        "Private spa suite reservations",
        "Wellness retreat planning",
        "Personal trainer arrangements",
        "Medical appointment coordination",
        "Meditation and yoga master classes",
      ],
      popular: false,
    },
    {
      id: "business",
      title: "Business Services",
      icon: Briefcase,
      description: "Professional support for business travelers",
      services: [
        "Meeting room and conference facility booking",
        "Translation and interpretation services",
        "Business card and document printing",
        "Secretarial and administrative support",
        "Technology setup and IT assistance",
      ],
      popular: false,
    },
    {
      id: "family",
      title: "Family & Children",
      icon: Baby,
      description: "Specialized services for families traveling with children",
      services: [
        "Babysitting and nanny services",
        "Child-friendly activity planning",
        "Educational tours and workshops",
        "Special meal arrangements for children",
        "Baby equipment rental and setup",
      ],
      popular: false,
    },
    {
      id: "special",
      title: "Special Occasions",
      icon: Gift,
      description: "Memorable celebrations and milestone events",
      services: [
        "Anniversary and birthday celebrations",
        "Proposal and engagement planning",
        "Wedding coordination and planning",
        "Corporate event management",
        "Surprise party organization",
      ],
      popular: true,
    },
  ];

  const recentRequests = [
    {
      id: "1",
      guest: "Robert Thompson",
      request: "Private wine tasting for anniversary celebration",
      status: "completed",
      concierge: "James Wellington",
      date: "2024-02-14",
      satisfaction: 5,
    },
    {
      id: "2",
      guest: "Sarah Kim",
      request: "Last-minute tickets to sold-out Broadway show",
      status: "in-progress",
      concierge: "Sofia Martinez",
      date: "2024-02-15",
      satisfaction: null,
    },
    {
      id: "3",
      guest: "Michael Chen",
      request: "Business meeting room setup with video conferencing",
      status: "completed",
      concierge: "David Chen",
      date: "2024-02-13",
      satisfaction: 5,
    },
  ];

  const chatMessages = [
    {
      id: "1",
      sender: "concierge",
      message:
        "Good afternoon! I'm James, your personal concierge. How may I assist you today?",
      time: "2:34 PM",
      avatar: "/staff/james.jpg",
    },
    {
      id: "2",
      sender: "guest",
      message:
        "Hi James! I'm looking for a romantic dinner reservation for tonight. Somewhere special for our anniversary.",
      time: "2:35 PM",
    },
    {
      id: "3",
      sender: "concierge",
      message:
        "Congratulations on your anniversary! I have the perfect place in mind. Let me check availability at Château Lumière - it's an intimate French restaurant with stunning city views. They're typically booked weeks ahead, but I have a special relationship with the chef.",
      time: "2:37 PM",
      avatar: "/staff/james.jpg",
    },
    {
      id: "4",
      sender: "guest",
      message: "That sounds perfect! What time would be available?",
      time: "2:38 PM",
    },
    {
      id: "5",
      sender: "concierge",
      message:
        "Excellent! I've secured a window table for 7:30 PM. I've also arranged for champagne service and asked them to prepare their anniversary dessert surprise. A private car will pick you up at 7:15 PM. Is there anything else I can arrange for this special evening?",
      time: "2:42 PM",
      avatar: "/staff/james.jpg",
    },
  ];

  const renderServices = () => (
    <div className="space-y-8">
      {/* Service Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-sheraton-cream rounded-lg">
                  <category.icon className="h-6 w-6 text-sheraton-navy" />
                </div>
                <div>
                  <h3 className="font-semibold text-sheraton-navy">
                    {category.title}
                  </h3>
                  {category.popular && (
                    <Badge className="bg-sheraton-gold text-sheraton-navy text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">{category.description}</p>
            <ul className="space-y-2 mb-4">
              {category.services.slice(0, 3).map((service, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-sheraton-gold mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{service}</span>
                </li>
              ))}
              {category.services.length > 3 && (
                <li className="text-sm text-sheraton-navy font-medium">
                  +{category.services.length - 3} more services
                </li>
              )}
            </ul>
            <Button className="w-full bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy">
              Request Service
            </Button>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-sheraton-navy mb-4">
          Quick Requests
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Utensils, label: "Restaurant Reservation", urgent: false },
            { icon: Car, label: "Transportation", urgent: false },
            { icon: Calendar, label: "Event Tickets", urgent: true },
            { icon: Gift, label: "Special Surprise", urgent: false },
          ].map((action, index) => (
            <button
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-sheraton-gold hover:bg-sheraton-gold/5 transition-colors group"
            >
              <action.icon className="h-8 w-8 text-sheraton-navy mx-auto mb-2 group-hover:text-sheraton-gold transition-colors" />
              <div className="text-sm font-medium text-gray-700 group-hover:text-sheraton-navy">
                {action.label}
              </div>
              {action.urgent && (
                <Badge variant="destructive" className="mt-1 text-xs">
                  Same Day
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-sheraton-navy mb-2">
          Meet Your Concierge Team
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our expert concierge professionals are dedicated to making your stay
          extraordinary. Each brings unique expertise and local knowledge to
          serve you better.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conciergeTeam.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center mb-4">
              <Avatar className="h-20 w-20 mx-auto mb-3">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-sheraton-navy">
                {member.name}
              </h3>
              <p className="text-sm text-gray-600">{member.title}</p>
              <div className="flex items-center justify-center space-x-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(member.rating)
                        ? "text-yellow-500 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">
                  {member.rating}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-sheraton-navy mb-1">
                  Specialties
                </h4>
                <div className="flex flex-wrap gap-1">
                  {member.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="outline"
                      className="text-xs"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-sheraton-navy mb-1">
                  Languages
                </h4>
                <p className="text-sm text-gray-600">
                  {member.languages.join(", ")}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-sheraton-navy mb-1">
                  Experience
                </h4>
                <p className="text-sm text-gray-600">{member.experience}</p>
              </div>

              <p className="text-sm text-gray-700">{member.description}</p>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-sheraton-gold text-sheraton-navy hover:bg-sheraton-gold/10"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-sheraton-gold text-sheraton-navy hover:bg-sheraton-gold/10"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Chat Header */}
        <div className="bg-sheraton-navy text-white p-4">
          <div className="flex items-center space-x-3">
            <Crown className="h-6 w-6 text-sheraton-gold" />
            <div>
              <h3 className="font-semibold">Concierge Live Chat</h3>
              <p className="text-sm text-gray-300">
                James Wellington is online and ready to assist
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "guest" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === "guest"
                    ? "bg-sheraton-gold text-sheraton-navy"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.sender === "concierge" && (
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={message.avatar} />
                      <AvatarFallback>J</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">James</span>
                  </div>
                )}
                <p className="text-sm">{message.message}</p>
                <p className="text-xs opacity-70 mt-1">{message.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  // Handle send message
                  setChatMessage("");
                }
              }}
            />
            <Button className="bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Average response time: 2 minutes • Available 24/7
          </p>
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6">
      {/* New Request Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-sheraton-navy mb-4">
          Submit New Request
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Request Type
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={requestForm.type}
              onChange={(e) =>
                setRequestForm((prev) => ({ ...prev, type: e.target.value }))
              }
            >
              <option value="">Select a service</option>
              <option value="dining">Dining & Reservations</option>
              <option value="transportation">Transportation</option>
              <option value="entertainment">Entertainment & Events</option>
              <option value="shopping">Personal Shopping</option>
              <option value="wellness">Wellness & Spa</option>
              <option value="business">Business Services</option>
              <option value="family">Family & Children</option>
              <option value="special">Special Occasions</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              placeholder="Brief description of your request"
              value={requestForm.title}
              onChange={(e) =>
                setRequestForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              Detailed Description
            </label>
            <Textarea
              placeholder="Please provide specific details about what you need..."
              value={requestForm.description}
              onChange={(e) =>
                setRequestForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred Date
            </label>
            <Input
              type="date"
              value={requestForm.date}
              onChange={(e) =>
                setRequestForm((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred Time
            </label>
            <Input
              type="time"
              value={requestForm.time}
              onChange={(e) =>
                setRequestForm((prev) => ({ ...prev, time: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Guests
            </label>
            <Input
              type="number"
              min="1"
              value={requestForm.guests}
              onChange={(e) =>
                setRequestForm((prev) => ({
                  ...prev,
                  guests: parseInt(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Budget Range
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={requestForm.budget}
              onChange={(e) =>
                setRequestForm((prev) => ({ ...prev, budget: e.target.value }))
              }
            >
              <option value="">Select budget range</option>
              <option value="under-500">Under $500</option>
              <option value="500-1000">$500 - $1,000</option>
              <option value="1000-2500">$1,000 - $2,500</option>
              <option value="2500-5000">$2,500 - $5,000</option>
              <option value="over-5000">Over $5,000</option>
              <option value="no-limit">No Budget Limit</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Special Preferences or Notes
          </label>
          <Textarea
            placeholder="Any additional preferences, allergies, or special requirements..."
            value={requestForm.preferences}
            onChange={(e) =>
              setRequestForm((prev) => ({
                ...prev,
                preferences: e.target.value,
              }))
            }
          />
        </div>
        <div className="mt-6 flex space-x-4">
          <Button className="flex-1 bg-sheraton-gold hover:bg-sheraton-gold/90 text-sheraton-navy">
            Submit Request
          </Button>
          <Button variant="outline" className="flex-1">
            Save as Draft
          </Button>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-sheraton-navy mb-4">
          Recent Requests
        </h3>
        <div className="space-y-4">
          {recentRequests.map((request) => (
            <div
              key={request.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-sheraton-navy">
                    {request.request}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Handled by {request.concierge} • {request.date}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    className={
                      request.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {request.status}
                  </Badge>
                  {request.satisfaction && (
                    <div className="flex items-center space-x-1">
                      {[...Array(request.satisfaction)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-yellow-500 fill-current"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                {request.status === "completed" && !request.satisfaction && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-sheraton-gold text-sheraton-navy"
                  >
                    Rate Service
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "services", label: "Our Services", content: renderServices },
    { id: "team", label: "Meet the Team", content: renderTeam },
    { id: "chat", label: "Live Chat", content: renderChat },
    { id: "requests", label: "My Requests", content: renderRequests },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sheraton-cream via-white to-sheraton-pearl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="h-10 w-10 text-sheraton-gold" />
            <h1 className="text-4xl font-bold text-sheraton-navy">
              Personal Concierge Services
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your dedicated concierge team is available 24/7 to transform your
            requests into reality. From impossible reservations to
            once-in-a-lifetime experiences, we make the extraordinary happen.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-sheraton-gold/10 border border-sheraton-gold rounded-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Phone className="h-5 w-5 text-sheraton-navy" />
              <div>
                <p className="font-medium text-sheraton-navy">Call Direct</p>
                <p className="text-sm text-gray-600">+1 (555) CONCIERGE</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <MessageSquare className="h-5 w-5 text-sheraton-navy" />
              <div>
                <p className="font-medium text-sheraton-navy">Live Chat</p>
                <p className="text-sm text-gray-600">Available 24/7</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-sheraton-navy" />
              <div>
                <p className="font-medium text-sheraton-navy">Response Time</p>
                <p className="text-sm text-gray-600">Under 15 minutes</p>
              </div>
            </div>
          </div>
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

export default ConciergePage;
