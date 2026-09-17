import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Landmark,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
} from "lucide-react";
import { useState } from "react";

interface PayoutMethod {
  id: string;
  type: "bank_account" | "wire_transfer";
  accountName: string;
  lastFour: string;
  bankName: string;
  isDefault: boolean;
}

export default function PayoutMethodPage() {
  const navigate = useNavigate();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([
    {
      id: "1",
      type: "bank_account",
      accountName: "Business Checking",
      lastFour: "1234",
      bankName: "Chase Bank",
      isDefault: true,
    },
  ]);

  const handleAddPayoutMethod = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Payout method added successfully");
    setIsAddingNew(false);
  };

  const handleRemove = (id: string) => {
    if (
      payoutMethods.find((m) => m.id === id)?.isDefault
    ) {
      alert("Cannot remove your default payout method");
      return;
    }
    setPayoutMethods((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setPayoutMethods((prev) =>
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
          <h1 className="text-3xl font-bold mb-2">Payout Methods</h1>
          <p className="text-muted-foreground">
            Manage where your earnings are paid out
          </p>
        </div>

        {/* Current Payout Methods */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold">Your Payout Methods</h2>
          {payoutMethods.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No payout methods added yet
                </p>
              </CardContent>
            </Card>
          ) : (
            payoutMethods.map((method) => (
              <Card key={method.id}>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <Landmark className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{method.accountName}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.bankName} • {method.type === "bank_account" ? "ACH" : "Wire"} ending in {method.lastFour}
                        </p>
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

        {/* Add New Payout Method */}
        {!isAddingNew && (
          <Button
            className="w-full mb-8"
            onClick={() => setIsAddingNew(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payout Method
          </Button>
        )}

        {isAddingNew && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Payout Method</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPayoutMethod} className="space-y-6">
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    placeholder="e.g., Business Checking"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g., Chase Bank"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      placeholder="000000000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      placeholder="123456789"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <select className="w-full px-3 py-2 border rounded-md">
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    Add Payout Method
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
