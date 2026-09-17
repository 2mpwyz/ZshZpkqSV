import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  CreditCard,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";
import { useState } from "react";

interface PaymentMethod {
  id: string;
  type: "credit_card" | "bank_account";
  last4: string;
  brand: string;
  expiryDate?: string;
  isDefault: boolean;
}

export default function PaymentMethodPage() {
  const navigate = useNavigate();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      type: "credit_card",
      last4: "4242",
      brand: "Visa",
      expiryDate: "12/25",
      isDefault: true,
    },
  ]);

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Payment method added successfully");
    setIsAddingNew(false);
  };

  const handleRemove = (id: string) => {
    if (
      paymentMethods.find((m) => m.id === id)?.isDefault
    ) {
      alert("Cannot remove your default payment method");
      return;
    }
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment Methods</h1>
          <p className="text-muted-foreground">
            Manage your payment methods for subscriptions and purchases
          </p>
        </div>

        {/* Current Payment Methods */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold">Your Payment Methods</h2>
          {paymentMethods.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No payment methods added yet
                </p>
              </CardContent>
            </Card>
          ) : (
            paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {method.brand} ending in {method.last4}
                        </p>
                        {method.expiryDate && (
                          <p className="text-sm text-muted-foreground">
                            Expires {method.expiryDate}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {method.isDefault && (
                        <Badge className="bg-green-100 text-green-800">
                          Default
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => alert("Edit functionality coming soon")}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemove(method.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add New Payment Method */}
        {!isAddingNew && (
          <Button
            className="w-full mb-8"
            onClick={() => setIsAddingNew(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        )}

        {isAddingNew && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPaymentMethod} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      required
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="12345"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    Add Payment Method
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsAddingNew(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
