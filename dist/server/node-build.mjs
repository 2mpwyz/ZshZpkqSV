import path from "path";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import crypto$1 from "node:crypto";
import { createClient } from "@supabase/supabase-js";
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
const zohoAccountsUrl = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com";
const zohoApiUrl = process.env.ZOHO_BOOKS_API_URL || "https://www.zohoapis.com/books/v3";
const callbackPath = "/api/zoho/books/callback";
const getConfig = () => {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const redirectUri = process.env.ZOHO_REDIRECT_URI;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const missing = [];
  if (!clientId) missing.push("ZOHO_CLIENT_ID");
  if (!clientSecret) missing.push("ZOHO_CLIENT_SECRET");
  if (!redirectUri) missing.push("ZOHO_REDIRECT_URI");
  if (!supabaseUrl) missing.push("SUPABASE_URL or VITE_SUPABASE_URL");
  if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) {
    throw new Error(`Zoho Books server configuration is incomplete. Missing server variable(s): ${missing.join(", ")}`);
  }
  const configuredRedirectUri = new URL(redirectUri);
  if (configuredRedirectUri.protocol !== "https:" || configuredRedirectUri.pathname !== callbackPath) {
    throw new Error(`ZOHO_REDIRECT_URI must use HTTPS and target ${callbackPath}`);
  }
  return { clientId, clientSecret, redirectUri: configuredRedirectUri.toString(), supabaseUrl, serviceRoleKey };
};
const getAdminClient = () => {
  const { supabaseUrl, serviceRoleKey } = getConfig();
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
};
const getUserId = async (authorization) => {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length);
  const admin = getAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
};
const requireUser = async (authorization, res) => {
  const userId = await getUserId(authorization);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }
  return userId;
};
const getRequestOrigin = (req) => {
  const protocol = req.headers["x-forwarded-proto"]?.toString().split(",")[0] || req.protocol;
  return `${protocol}://${req.get("host")}`;
};
const getReturnTo = (req) => {
  const fallback = new URL("/books", getRequestOrigin(req));
  const requestedReturnTo = typeof req.query.returnTo === "string" ? req.query.returnTo : "";
  if (!requestedReturnTo) return fallback.toString();
  const allowedOrigins = /* @__PURE__ */ new Set([getRequestOrigin(req)]);
  for (const origin of (process.env.ZOHO_ALLOWED_RETURN_ORIGINS || "").split(",")) {
    if (!origin.trim()) continue;
    allowedOrigins.add(new URL(origin.trim()).origin);
  }
  try {
    const returnTo = new URL(requestedReturnTo);
    if (returnTo.protocol !== "https:" || !allowedOrigins.has(returnTo.origin)) return fallback.toString();
    returnTo.searchParams.delete("connected");
    returnTo.searchParams.delete("error");
    return returnTo.toString();
  } catch {
    return fallback.toString();
  }
};
const encodeState = (state) => {
  const { clientSecret } = getConfig();
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  const signature = crypto$1.createHmac("sha256", clientSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};
const verifyState = (state) => {
  const { clientSecret } = getConfig();
  const [payload, signature, ...rest] = state.split(".");
  if (!payload || !signature || rest.length > 0) throw new Error("Invalid Zoho authorization state");
  const expected = crypto$1.createHmac("sha256", clientSecret).update(payload).digest("base64url");
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length || !crypto$1.timingSafeEqual(receivedBuffer, expectedBuffer)) {
    throw new Error("Invalid Zoho authorization state");
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof parsed.userId !== "string" || typeof parsed.returnTo !== "string" || typeof parsed.expiresAt !== "number" || parsed.expiresAt <= Date.now()) {
      throw new Error("Invalid Zoho authorization state");
    }
    return { userId: parsed.userId, returnTo: parsed.returnTo, expiresAt: parsed.expiresAt };
  } catch {
    throw new Error("Invalid Zoho authorization state");
  }
};
const getIntegration = async (admin, userId) => {
  const { data, error } = await admin.from("zoho_books_integrations").select("user_id, access_token, refresh_token, token_expires_at, organization_id, is_connected, connected_at").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
};
const saveTokens = async (admin, userId, tokens) => {
  const { error } = await admin.from("zoho_books_integrations").upsert({
    user_id: userId,
    access_token: tokens.access_token,
    ...tokens.refresh_token ? { refresh_token: tokens.refresh_token } : {},
    token_expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1e3).toISOString(),
    is_connected: true,
    connected_at: (/* @__PURE__ */ new Date()).toISOString(),
    disconnected_at: null,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }, { onConflict: "user_id" });
  if (error) throw error;
};
const refreshAccessToken = async (admin, integration) => {
  if (!integration.refresh_token) throw new Error("Zoho refresh token is unavailable");
  const { clientId, clientSecret } = getConfig();
  const response = await fetch(`${zohoAccountsUrl}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: integration.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token"
    })
  });
  const tokens = await response.json();
  if (!response.ok || !tokens.access_token) throw new Error(tokens.error || "Zoho token refresh failed");
  await saveTokens(admin, integration.user_id, {
    access_token: tokens.access_token,
    expires_in: tokens.expires_in
  });
  return tokens.access_token;
};
const getAccessToken = async (admin, integration) => {
  if (!integration.access_token) throw new Error("Zoho is not connected");
  const expiresAt = integration.token_expires_at ? Date.parse(integration.token_expires_at) : 0;
  if (expiresAt > Date.now() + 6e4) return integration.access_token;
  return refreshAccessToken(admin, integration);
};
const zohoFetch = async (admin, integration, path2) => {
  const accessToken = await getAccessToken(admin, integration);
  const response = await fetch(`${zohoApiUrl}${path2}`, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
  });
  const data = await response.json();
  if (!response.ok || typeof data.code === "number" && data.code !== 0) {
    throw new Error(data.message || "Zoho Books request failed");
  }
  return data;
};
const startZohoBooksConnect = async (req, res) => {
  try {
    const userId = await requireUser(req.headers.authorization, res);
    if (!userId) return;
    const { clientId, redirectUri } = getConfig();
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: "ZohoBooks.contacts.READ,ZohoBooks.invoices.READ,ZohoBooks.settings.READ",
      access_type: "offline",
      prompt: "consent",
      state: encodeState({
        userId,
        returnTo: getReturnTo(req),
        expiresAt: Date.now() + 10 * 60 * 1e3
      })
    });
    res.json({ url: `${zohoAccountsUrl}/oauth/v2/auth?${params.toString()}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to start Zoho connection" });
  }
};
const completeAuthorization = async (userId, code) => {
  const { clientId, clientSecret, redirectUri } = getConfig();
  const response = await fetch(`${zohoAccountsUrl}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });
  const tokens = await response.json();
  if (!response.ok || !tokens.access_token) throw new Error(tokens.error || "Zoho authorization failed");
  const admin = getAdminClient();
  await saveTokens(admin, userId, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in
  });
  const integration = await getIntegration(admin, userId);
  if (integration) {
    const organizations = await zohoFetch(admin, integration, "/organizations");
    const firstOrganization = organizations.organizations?.[0];
    if (firstOrganization) {
      const { error } = await admin.from("zoho_books_integrations").update({ organization_id: firstOrganization.organization_id }).eq("user_id", userId);
      if (error) throw error;
    }
  }
};
const getBooksRedirectUri = (returnTo, error) => {
  const booksUrl = new URL(returnTo);
  booksUrl.searchParams.delete("connected");
  booksUrl.searchParams.delete("error");
  booksUrl.searchParams.set(error ? "error" : "connected", error || "1");
  return booksUrl.toString();
};
const completeZohoBooksCallback = async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : "";
  const state = typeof req.query.state === "string" ? req.query.state : "";
  let returnTo = new URL("/books", getRequestOrigin(req)).toString();
  try {
    const authorization = verifyState(state);
    returnTo = authorization.returnTo;
    if (!code) throw new Error("Zoho authorization was not completed");
    await completeAuthorization(authorization.userId, code);
    res.redirect(302, getBooksRedirectUri(returnTo));
  } catch {
    res.redirect(302, getBooksRedirectUri(returnTo, "authorization"));
  }
};
const getZohoBooksStatus = async (req, res) => {
  try {
    const userId = await requireUser(req.headers.authorization, res);
    if (!userId) return;
    const integration = await getIntegration(getAdminClient(), userId);
    res.json({
      connected: Boolean(integration?.is_connected && integration.access_token),
      organizationId: integration?.organization_id || null,
      connectedAt: integration?.connected_at || null
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to load Zoho status" });
  }
};
const getZohoBooksData = async (req, res) => {
  try {
    const userId = await requireUser(req.headers.authorization, res);
    if (!userId) return;
    const admin = getAdminClient();
    const integration = await getIntegration(admin, userId);
    if (!integration?.is_connected || !integration.organization_id) {
      res.status(409).json({ error: "Connect a Zoho Books organization first" });
      return;
    }
    const query = `?organization_id=${encodeURIComponent(integration.organization_id)}`;
    const [invoices, contacts] = await Promise.all([
      zohoFetch(admin, integration, `/invoices${query}&per_page=5&sort_column=last_modified_time`),
      zohoFetch(admin, integration, `/contacts${query}&per_page=5`)
    ]);
    res.json({
      invoices: invoices.invoices || [],
      contacts: contacts.contacts || [],
      organizationId: integration.organization_id
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to load Zoho Books data" });
  }
};
const disconnectZohoBooks = async (req, res) => {
  try {
    const userId = await requireUser(req.headers.authorization, res);
    if (!userId) return;
    const { error } = await getAdminClient().from("zoho_books_integrations").update({
      access_token: null,
      refresh_token: null,
      token_expires_at: null,
      organization_id: null,
      is_connected: false,
      disconnected_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("user_id", userId);
    if (error) throw error;
    res.json({ connected: false });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to disconnect Zoho" });
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
  app2.get("/api/zoho/books/connect", startZohoBooksConnect);
  app2.get("/api/zoho/books/callback", completeZohoBooksCallback);
  app2.get("/api/zoho/books/status", getZohoBooksStatus);
  app2.get("/api/zoho/books/data", getZohoBooksData);
  app2.post("/api/zoho/books/disconnect", disconnectZohoBooks);
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
