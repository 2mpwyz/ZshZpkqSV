import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { clearPendingCheckout } from "../lib/flutterwave";
import { supabase } from "../lib/supabase";

type PaymentResult =
  | { status: "loading" }
  | { status: "success"; orderNumber: string }
  | { status: "cancelled"; message: string }
  | { status: "error"; message: string };

const getInitialPaymentResult = (searchParams: URLSearchParams): PaymentResult => {
  const status = searchParams.get("status");

  if (status === "cancelled") {
    return {
      status: "cancelled",
      message: "The payment was cancelled. Your order is still saved and ready to try again.",
    };
  }

  if (status && status !== "successful") {
    return {
      status: "error",
      message: "Flutterwave did not return a completed payment. Your order is still saved so you can try again.",
    };
  }

  return { status: "loading" };
};

const FlutterwaveReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<PaymentResult>(() => getInitialPaymentResult(searchParams));

  useEffect(() => {
    let active = true;

    const verifyPayment = async () => {
      const transactionId = searchParams.get("transaction_id");
      const txRef = searchParams.get("tx_ref");
      const status = searchParams.get("status");

      if (status !== "successful") {
        const { data: { session } } = await supabase.auth.getSession();
        if (txRef && session?.access_token) {
          fetch("/api/payments/flutterwave/cancel", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              txRef,
              status: status === "cancelled" ? "cancelled" : "failed",
            }),
          }).catch((error) => console.error("Unable to record payment cancellation", error));
        }

        if (active) {
          setResult({
            status: status === "cancelled" ? "cancelled" : "error",
            message:
              status === "cancelled"
                ? "The payment was cancelled. Your order is still saved and ready to try again."
                : "Flutterwave did not return a completed payment. Your order is still saved so you can try again.",
          });
        }
        return;
      }

      if (!transactionId || !txRef) {
        if (active) {
          setResult({
            status: "error",
            message: "The payment response was incomplete. Your order is still saved so you can try again.",
          });
        }
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        if (active) {
          setResult({
            status: "error",
            message: "Your session expired before payment could be confirmed. Sign in again, then retry this payment.",
          });
        }
        return;
      }

      try {
        const response = await fetch("/api/payments/flutterwave/verify", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ transactionId, txRef }),
        });
        const payload = (await response.json()) as {
          orderNumber?: string;
          paymentStatus?: string;
          error?: string;
        };

        if (!response.ok || payload.paymentStatus !== "paid" || !payload.orderNumber) {
          throw new Error(payload.error || "Payment could not be confirmed.");
        }

        clearPendingCheckout();
        if (active) setResult({ status: "success", orderNumber: payload.orderNumber });
      } catch (error) {
        if (active) {
          setResult({
            status: "error",
            message: error instanceof Error ? error.message : "Payment could not be confirmed.",
          });
        }
      }
    };

    verifyPayment();
    return () => {
      active = false;
    };
  }, [searchParams]);

  const retryPayment = () => {
    navigate("/menu", { replace: true });
  };

  const returnToMenu = () => {
    clearPendingCheckout();
    navigate("/menu", { replace: true });
  };

  return (
    <div className="w-full bg-background">
      <main className="container py-8 sm:py-10">
        <div className="mx-auto max-w-2xl rounded-xl border bg-white p-6 text-center shadow-sm sm:p-10">
          {result.status === "loading" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-sheraton-gold" />
              <h1 className="mt-5 text-2xl font-semibold text-sheraton-navy">Confirming your payment</h1>
              <p className="mt-2 text-muted-foreground">Please wait while we verify the transaction securely.</p>
            </>
          )}

          {result.status === "success" && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h1 className="mt-5 text-2xl font-semibold text-sheraton-navy">Order Confirmed</h1>
              <p className="mt-2 text-muted-foreground">Your payment was received and your order is being prepared.</p>
              <div className="mt-6 rounded-lg bg-sheraton-cream p-4">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="mt-1 text-2xl font-bold text-sheraton-navy">{result.orderNumber}</p>
              </div>
              <Button onClick={returnToMenu} className="mt-6 bg-sheraton-gold text-sheraton-navy hover:bg-sheraton-gold/90">
                Return to Menu
              </Button>
            </>
          )}

          {result.status === "cancelled" && (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-amber-600" />
              <h1 className="mt-5 text-2xl font-semibold text-sheraton-navy">Payment cancelled</h1>
              <p className="mt-2 text-muted-foreground">{result.message}</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button onClick={retryPayment} className="bg-sheraton-gold text-sheraton-navy hover:bg-sheraton-gold/90">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try payment again
                </Button>
                <Button onClick={returnToMenu} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Menu
                </Button>
              </div>
            </>
          )}

          {result.status === "error" && (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
              <h1 className="mt-5 text-2xl font-semibold text-sheraton-navy">Payment needs attention</h1>
              <p className="mt-2 text-muted-foreground">{result.message}</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button onClick={retryPayment} className="bg-sheraton-gold text-sheraton-navy hover:bg-sheraton-gold/90">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try payment again
                </Button>
                <Button onClick={returnToMenu} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Menu
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default FlutterwaveReturnPage;
