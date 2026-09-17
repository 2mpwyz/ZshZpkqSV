import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import {
  CreditCard,
  Wallet,
  History,
  Download,
  Receipt,
  DollarSign,
} from "lucide-react";

interface BillingTabProps {
  userRole: 'manager' | 'service_provider' | null;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    location: string;
  };
}

export const BillingTab = ({ userRole, userData }: BillingTabProps) => {
  const navigate = useNavigate();

  const commonBillingContent = (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-sheraton-gold" />
            Subscription Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Plan */}
            <Card className="border-sheraton-gold/20 bg-sheraton-gold/5">
              <CardHeader>
                <CardTitle className="text-lg">Current Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plan Type</span>
                  <Badge className="bg-sheraton-gold text-black">
                    {userRole === 'manager' ? 'Professional' : 'Service Provider'}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Monthly Cost
                    </span>
                    <span className="text-lg font-bold">
                      {userRole === 'manager' ? '$99/mo' : '$49/mo'}
                    </span>
                  </div>
                  {userRole === 'service_provider' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Commission Rate
                      </span>
                      <span className="text-sm">10% per booking</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Billing Date
                    </span>
                    <span className="text-sm">1st of each month</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      Active
                    </Badge>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline" onClick={() => navigate('/billing/plans')}>
                  {userRole === 'manager' ? 'Upgrade Plan' : 'View Plans'}
                </Button>
              </CardContent>
            </Card>

            {/* Billing Address / Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {userRole === 'manager' ? 'Billing Address' : 'Earnings Summary'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userRole === 'manager' ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Company / Full Name
                      </Label>
                      <p className="text-sm font-medium">{userData.firstName} {userData.lastName}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Email
                      </Label>
                      <p className="text-sm">{userData.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Address
                      </Label>
                      <p className="text-sm">{userData.location || 'Not provided'}</p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/profile?edit=billing')}>
                      Edit Billing Address
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          This Month
                        </span>
                        <span className="text-lg font-bold text-sheraton-gold">
                          $2,450.00
                        </span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Platform Fee (10%)
                        </span>
                        <span className="text-sm">-$245.00</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Net Earnings
                        </span>
                        <span className="text-lg font-bold">$2,205.00</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods - for both manager and service provider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-sheraton-gold" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">
                    Expires 12/25
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Default</Badge>
            </div>
          </div>
          <Button className="w-full" variant="outline" onClick={() => navigate('/billing/payment-methods')}>
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Payout Methods - for both manager and service provider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-sheraton-gold" />
            Payout Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Bank Account ending in 1234</p>
                  <p className="text-xs text-muted-foreground">
                    ACH Transfer
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Default</Badge>
            </div>
          </div>
          <Button className="w-full" variant="outline" onClick={() => navigate('/billing/payout-methods')}>
            Add Payout Method
          </Button>
        </CardContent>
      </Card>

      {/* Billing/Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-sheraton-gold" />
            {userRole === 'manager' ? 'Billing History' : 'Transaction History'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userRole === 'manager' ? (
              <>
                {[
                  { date: 'May 1, 2024', amount: '$99.00', status: 'Paid' },
                  { date: 'Apr 1, 2024', amount: '$99.00', status: 'Paid' },
                  { date: 'Mar 1, 2024', amount: '$99.00', status: 'Paid' },
                ].map((invoice, idx) => (
                  <div
                    key={idx}
                    className="p-4 border rounded-lg flex items-center justify-between hover:bg-accent transition"
                  >
                    <div className="flex items-center gap-3">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{invoice.date}</p>
                        <p className="text-xs text-muted-foreground">
                          Monthly subscription
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{invoice.amount}</span>
                      <Badge
                        variant="outline"
                        className="border-green-500 text-green-700"
                      >
                        {invoice.status}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => {
                        const invoiceFile = new Blob(['Invoice details...'], { type: 'text/plain' });
                        const url = window.URL.createObjectURL(invoiceFile);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `invoice-${invoice.date.replace(/\s+/g, '-')}.txt`;
                        link.click();
                        window.URL.revokeObjectURL(url);
                      }}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { date: 'May 10, 2024', amount: '$2,205.00', type: 'Payout', status: 'Completed' },
                  { date: 'Apr 10, 2024', amount: '$1,890.00', type: 'Payout', status: 'Completed' },
                  { date: 'Mar 10, 2024', amount: '$2,450.00', type: 'Payout', status: 'Completed' },
                ].map((transaction, idx) => (
                  <div
                    key={idx}
                    className="p-4 border rounded-lg flex items-center justify-between hover:bg-accent transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-sheraton-gold/10 rounded">
                        <DollarSign className="h-4 w-4 text-sheraton-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.date}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-sheraton-gold">
                        +{transaction.amount}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-green-500 text-green-700"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <>
      {commonBillingContent}
    </>
  );
};
