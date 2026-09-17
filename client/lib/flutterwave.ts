export interface FlutterwaveHostedSession {
  paymentUrl: string;
  txRef: string;
  orderId: string;
}

export interface PendingCheckoutContext {
  orderId: string;
  orderNumber: string;
  cart: Record<string, number>;
  orderType: "delivery" | "take-away" | "dine-in" | "room-service";
  paymentMethod: "card" | "room-charge" | "cash" | "mobile-money";
  tipAmount: number;
  tipPercentage: number;
  usePoints: boolean;
}

export interface ResumableMenuOrder {
  orderId: string;
  orderNumber: string;
  cart: Record<string, number>;
  orderType: PendingCheckoutContext["orderType"];
  paymentMethod: Extract<PendingCheckoutContext["paymentMethod"], "card" | "mobile-money">;
  tipAmount: number;
  tipPercentage: number;
  usePoints: boolean;
}

const pendingCheckoutKey = "sheraton.pending-checkout";

export const savePendingCheckout = (context: PendingCheckoutContext) => {
  sessionStorage.setItem(pendingCheckoutKey, JSON.stringify(context));
};

export const getPendingCheckout = (): PendingCheckoutContext | null => {
  const storedContext = sessionStorage.getItem(pendingCheckoutKey);
  if (!storedContext) return null;

  try {
    const context = JSON.parse(storedContext) as Partial<PendingCheckoutContext>;
    if (
      typeof context.orderId !== "string" ||
      typeof context.orderNumber !== "string" ||
      !context.cart ||
      typeof context.cart !== "object" ||
      !context.orderType ||
      !context.paymentMethod ||
      typeof context.tipAmount !== "number" ||
      typeof context.tipPercentage !== "number" ||
      typeof context.usePoints !== "boolean"
    ) {
      return null;
    }
    return context as PendingCheckoutContext;
  } catch {
    return null;
  }
};

export const clearPendingCheckout = () => {
  sessionStorage.removeItem(pendingCheckoutKey);
};
