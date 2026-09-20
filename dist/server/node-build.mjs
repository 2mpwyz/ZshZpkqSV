import path from "path";
import * as express from "express";
import express__default from "express";
import cors from "cors";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const flutterwaveBaseUrl = "https://api.flutterwave.com/v3";
const flutterwaveReturnPath = "/checkout/flutterwave-return";
class FlutterwaveRequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
const getFlutterwaveReturnUrl = () => {
  const returnUrl = process.env.FLUTTERWAVE_RETURN_URL;
  if (!returnUrl) throw new Error("Flutterwave return URL is not configured");
  const parsedUrl = new URL(returnUrl);
  if (parsedUrl.protocol !== "https:" || parsedUrl.pathname !== flutterwaveReturnPath) {
    throw new Error("Flutterwave return URL must use HTTPS and target the payment return route");
  }
  return parsedUrl.toString();
};
const getConfiguration = () => {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const defaultCurrency = process.env.FLUTTERWAVE_CURRENCY || "USD";
  if (!secretKey || !secretHash || !supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error("Flutterwave payment configuration is incomplete");
  }
  return {
    secretKey,
    secretHash,
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    defaultCurrency
  };
};
const getAuthenticatedOrder = async (orderId, authorization) => {
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Missing authenticated session");
  }
  const { supabaseUrl, supabaseAnonKey } = getConfiguration();
  const response = await fetch(
    `${supabaseUrl}/rest/v1/menu_orders?id=eq.${encodeURIComponent(orderId)}&select=*`,
    {
      headers: {
        apikey: supabaseAnonKey,
        authorization
      }
    }
  );
  if (!response.ok) throw new Error("Unable to retrieve this order");
  const [order] = await response.json();
  if (!order) throw new Error("Order not found");
  return order;
};
const getOrderByPaymentReference = async (paymentReference) => {
  const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = getConfiguration();
  const response = await fetch(
    `${supabaseUrl}/rest/v1/menu_orders?payment_reference=eq.${encodeURIComponent(paymentReference)}&select=*`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`
      }
    }
  );
  if (!response.ok) throw new Error("Unable to retrieve payment order");
  const [order] = await response.json();
  if (!order) throw new Error("Payment order not found");
  return order;
};
const updatePaymentAttemptAsService = async (txRef, values) => {
  const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = getConfiguration();
  const response = await fetch(
    `${supabaseUrl}/rest/v1/menu_payment_attempts?tx_ref=eq.${encodeURIComponent(txRef)}`,
    {
      method: "PATCH",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        "content-type": "application/json",
        prefer: "return=minimal"
      },
      body: JSON.stringify({ ...values, updated_at: (/* @__PURE__ */ new Date()).toISOString() })
    }
  );
  if (!response.ok) throw new Error("Unable to update payment attempt");
};
const createPaymentAttemptAsService = async (values) => {
  const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = getConfiguration();
  const response = await fetch(`${supabaseUrl}/rest/v1/menu_payment_attempts`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "content-type": "application/json",
      prefer: "return=minimal"
    },
    body: JSON.stringify(values)
  });
  if (!response.ok) throw new Error("Unable to create payment attempt");
};
const updateOrderAsService = async (orderId, values) => {
  const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = getConfiguration();
  const response = await fetch(
    `${supabaseUrl}/rest/v1/menu_orders?id=eq.${encodeURIComponent(orderId)}`,
    {
      method: "PATCH",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        "content-type": "application/json",
        prefer: "return=minimal"
      },
      body: JSON.stringify(values)
    }
  );
  if (!response.ok) throw new Error("Unable to update payment order");
};
const getPaymentOptions = (paymentMethod, currency) => {
  if (paymentMethod !== "mobile-money") return "card";
  if (currency !== "UGX") {
    throw new Error("Mobile Money is available only when checkout prices are configured in UGX.");
  }
  return "mobilemoneyuganda";
};
const verifyTransaction = async (transactionId) => {
  const { secretKey } = getConfiguration();
  const response = await fetch(
    `${flutterwaveBaseUrl}/transactions/${encodeURIComponent(transactionId)}/verify`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  const payload = await response.json();
  if (!response.ok || payload.status !== "success" || !payload.data) {
    throw new Error("Payment could not be verified");
  }
  return payload.data;
};
const confirmPayment = async (transaction, transactionReference, order) => {
  const metadataOrderId = transaction.meta?.order_id;
  if (metadataOrderId !== order.id) {
    throw new Error("Payment metadata does not match the order");
  }
  const { defaultCurrency } = getConfiguration();
  const currency = String(order.currency || defaultCurrency).toUpperCase();
  if (transaction.status !== "successful" || transaction.tx_ref !== transactionReference || Number(transaction.amount) !== Number(order.total_amount) || transaction.currency !== currency) {
    throw new Error("Payment verification data does not match the order");
  }
  if (order.payment_status === "paid") return { order, paymentStatus: "paid" };
  await updateOrderAsService(order.id, {
    status: "confirmed",
    payment_status: "paid",
    payment_reference: transactionReference,
    flutterwave_transaction_id: String(transaction.id)
  });
  await updatePaymentAttemptAsService(transactionReference, {
    transaction_id: String(transaction.id),
    status: "completed",
    completed_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  return { order, paymentStatus: "paid" };
};
const prepareFlutterwaveHostedSession = async ({ orderId, paymentAmount, paymentCurrency }, authorization) => {
  let txRef;
  try {
    if (!orderId) throw new Error("Order ID is required");
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0 || !paymentCurrency) {
      throw new Error("Checkout amount is invalid");
    }
    const order = await getAuthenticatedOrder(orderId, authorization);
    if (order.payment_status === "paid") {
      throw new FlutterwaveRequestError("This order has already been paid", 409);
    }
    const { secretKey } = getConfiguration();
    const amount = Number(paymentAmount);
    const currency = String(paymentCurrency).toUpperCase();
    await updateOrderAsService(order.id, {
      total_amount: amount,
      currency,
      payment_status: "pending"
    });
    txRef = `sheraton-${order.order_number}-${crypto.randomUUID()}`;
    await createPaymentAttemptAsService({
      order_id: order.id,
      tx_ref: txRef,
      amount,
      currency,
      status: "initiated"
    });
    const paymentOptions = getPaymentOptions(order.payment_method, currency);
    const returnUrl = getFlutterwaveReturnUrl();
    const response = await fetch(`${flutterwaveBaseUrl}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount,
        currency,
        payment_options: paymentOptions,
        redirect_url: returnUrl,
        customer: {
          email: order.email,
          name: `${order.first_name} ${order.last_name}`.trim(),
          phonenumber: order.phone
        },
        meta: { order_id: order.id },
        customizations: {
          title: "Sheraton Special",
          description: `Order ${order.order_number}`
        }
      })
    });
    const payload = await response.json();
    if (!response.ok || payload.status !== "success" || !payload.data?.link) {
      throw new Error("Unable to create secure payment page");
    }
    await updatePaymentAttemptAsService(txRef, {
      status: "redirected",
      payment_url: payload.data.link
    });
    await updateOrderAsService(order.id, {
      payment_reference: txRef,
      payment_status: "pending"
    });
    return {
      paymentUrl: payload.data.link,
      txRef,
      orderId: order.id
    };
  } catch (error) {
    if (txRef) {
      await updatePaymentAttemptAsService(txRef, {
        status: "failed",
        failure_reason: error instanceof Error ? error.message : "Unable to prepare payment"
      }).catch((attemptError) => console.error("Unable to record failed payment attempt", attemptError));
    }
    throw error;
  }
};
const createFlutterwaveHostedSession = async (req, res) => {
  try {
    const paymentSession = await prepareFlutterwaveHostedSession(
      req.body,
      req.headers.authorization
    );
    return res.json(paymentSession);
  } catch (error) {
    console.error("Flutterwave hosted session error", error);
    return res.status(error instanceof FlutterwaveRequestError ? error.status : 400).json({
      error: error instanceof Error ? error.message : "Unable to prepare payment"
    });
  }
};
const cancelFlutterwavePayment = async (req, res) => {
  try {
    const { txRef, status } = req.body;
    if (!txRef) return res.status(400).json({ error: "Payment reference is required" });
    if (status !== "cancelled" && status !== "failed") {
      return res.status(400).json({ error: "Payment outcome is invalid" });
    }
    const order = await getOrderByPaymentReference(txRef);
    await getAuthenticatedOrder(order.id, req.headers.authorization);
    await updatePaymentAttemptAsService(txRef, {
      status,
      ...status === "cancelled" ? { cancelled_at: (/* @__PURE__ */ new Date()).toISOString() } : { failure_reason: "Flutterwave returned an unsuccessful payment status" }
    });
    await updateOrderAsService(order.id, { payment_status: status });
    return res.json({ orderId: order.id, paymentStatus: status });
  } catch (error) {
    console.error("Flutterwave payment cancellation error", error);
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to record payment cancellation"
    });
  }
};
const verifyFlutterwavePayment = async (req, res) => {
  try {
    const { transactionId, txRef } = req.body;
    if (!transactionId || !txRef) {
      return res.status(400).json({ error: "Payment verification details are required" });
    }
    const order = await getOrderByPaymentReference(txRef);
    await getAuthenticatedOrder(order.id, req.headers.authorization);
    const transaction = await verifyTransaction(String(transactionId));
    const result = await confirmPayment(transaction, txRef, order);
    return res.json({
      orderId: result.order.id,
      orderNumber: result.order.order_number,
      paymentStatus: result.paymentStatus
    });
  } catch (error) {
    console.error("Flutterwave payment verification error", error);
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to verify payment"
    });
  }
};
const handleFlutterwaveWebhook = async (req, res) => {
  const signature = req.headers["verif-hash"];
  const { secretHash } = getConfiguration();
  if (!signature || signature !== secretHash) {
    return res.status(401).end();
  }
  const payload = req.body;
  if (payload.event !== "charge.completed" || !payload.data?.id || !payload.data.tx_ref) {
    return res.status(200).end();
  }
  try {
    const order = await getOrderByPaymentReference(payload.data.tx_ref);
    await confirmPayment(
      await verifyTransaction(String(payload.data.id)),
      payload.data.tx_ref,
      order
    );
    return res.status(200).end();
  } catch (error) {
    console.error("Flutterwave webhook processing error", error);
    return res.status(500).end();
  }
};
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });
  app2.get("/api/demo", handleDemo);
  app2.post("/api/payments/flutterwave/hosted-session", createFlutterwaveHostedSession);
  app2.post("/api/payments/flutterwave/cancel", cancelFlutterwavePayment);
  app2.post("/api/payments/flutterwave/verify", verifyFlutterwavePayment);
  app2.post("/api/payments/flutterwave/webhook", handleFlutterwaveWebhook);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
