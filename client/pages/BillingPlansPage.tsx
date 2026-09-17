import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Check, ArrowLeft } from "lucide-react";

export default function BillingPlansPage() {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "Up to 10 tasks",
        "Basic analytics",
        "Email support",
        "Single user account",
      ],
      isCurrent: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "Most popular for growing businesses",
      features: [
        "Unlimited tasks",
        "Advanced analytics",
        "Priority support",
        "Team collaboration",
        "Custom integrations",
        "API access",
      ],
      isCurrent: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "Custom features",
        "SLA guarantee",
        "On-premise option",
      ],
      isCurrent: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Plans & Pricing</h1>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan for your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col ${
                plan.isCurrent
                  ? "border-sheraton-gold border-2 relative"
                  : "hover:border-sheraton-gold/50"
              }`}
            >
              {plan.isCurrent && (
                <Badge className="absolute top-4 right-4 bg-sheraton-gold text-black">
                  Current Plan
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-sheraton-gold flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={plan.isCurrent ? "outline" : "default"}
                  onClick={() => {
                    if (plan.isCurrent) {
                      alert(`You are already on the ${plan.name} plan`);
                    } else {
                      alert(`Upgrade to ${plan.name} plan - this would process payment`);
                      navigate("/profile");
                    }
                  }}
                >
                  {plan.isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
