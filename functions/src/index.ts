import { createHmac, timingSafeEqual } from "node:crypto";
import { Readable } from "node:stream";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { parse } from "csv-parse";
import { onRequest } from "firebase-functions/v2/https";
import PDFDocument from "pdfkit";
import { createClient } from "@supabase/supabase-js";

type BankRecord = Record<string, string>;
type InvoicePayload = { record?: { id?: string; status?: string }; old_record?: { status?: string } };
type ImportPayload = { importId?: string; organizationId?: string; storageKey?: string; fileUrl?: string };

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
};

const supabase = () => createClient(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { autoRefreshToken: false, persistSession: false },
});

const b2 = () => new S3Client({
  region: process.env.B2_REGION || "us-east-1",
  endpoint: required("B2_ENDPOINT"),
  credentials: {
    accessKeyId: required("B2_KEY_ID"),
    secretAccessKey: required("B2_APPLICATION_KEY"),
  },
});

const bucket = () => required("B2_BUCKET_NAME");

function verifyWebhook(request: Parameters<typeof onRequest>[0] extends never ? never : any, rawBody: Buffer): void {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret) throw new Error("SUPABASE_WEBHOOK_SECRET is not configured");
  const signature = request.header("x-supabase-webhook-signature");
  if (!signature) throw new Error("Missing webhook signature");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = Buffer.from(signature, "utf8");
  const calculated = Buffer.from(expected, "utf8");
  if (provided.length !== calculated.length || !timingSafeEqual(provided, calculated)) {
    throw new Error("Invalid webhook signature");
  }
}

function jsonBody(request: any): { value: unknown; raw: Buffer } {
  const raw = Buffer.isBuffer(request.rawBody)
    ? request.rawBody
    : Buffer.from(JSON.stringify(request.body ?? {}));
  return { value: request.body ?? JSON.parse(raw.toString("utf8")), raw };
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findHeader(headers: string[], candidates: string[]): string | undefined {
  const normalized = new Map(headers.map((header) => [normalizeHeader(header), header]));
  return candidates.map(normalizeHeader).map((candidate) => normalized.get(candidate)).find(Boolean);
}

function parseAmount(value: string | undefined): number {
  if (!value) return 0;
  const normalized = value.replace(/[(),\s]/g, "").replace(/,/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function parseDate(value: string | undefined): string {
  if (!value) throw new Error("Bank row is missing a transaction date");
  const trimmed = value.trim();
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid transaction date: ${value}`);
  return date.toISOString().slice(0, 10);
}

async function readObject(key: string): Promise<Buffer> {
  const response = await b2().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  if (!response.Body) throw new Error("B2 returned an empty file");
  return Buffer.from(await response.Body.transformToByteArray());
}

async function readImportFile(payload: ImportPayload): Promise<Buffer> {
  if (payload.storageKey) return readObject(payload.storageKey);
  if (!payload.fileUrl) throw new Error("A B2 storageKey or approved fileUrl is required");
  const allowedHosts = [process.env.B2_ENDPOINT, process.env.B2_PUBLIC_URL]
    .filter(Boolean)
    .map((value) => new URL(value as string).hostname);
  const url = new URL(payload.fileUrl);
  if (!allowedHosts.includes(url.hostname)) throw new Error("fileUrl is not an approved B2 URL");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download bank file (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

async function insertBankRows(importId: string, organizationId: string, csv: Buffer): Promise<number> {
  const records = await new Promise<BankRecord[]>((resolve, reject) => {
    const rows: BankRecord[] = [];
    const parser = parse({ columns: true, skip_empty_lines: true, trim: true, relax_column_count: true });
    parser.on("readable", () => {
      let row: BankRecord | null;
      while ((row = parser.read() as BankRecord | null)) rows.push(row);
    });
    parser.once("error", reject);
    parser.once("end", () => resolve(rows));
    Readable.from([csv]).pipe(parser);
  });

  if (!records.length) throw new Error("The bank CSV contains no rows");
  const headers = Object.keys(records[0]);
  const dateHeader = findHeader(headers, ["date", "transaction date", "value date"]);
  const descriptionHeader = findHeader(headers, ["description", "transaction description", "narration", "extended text"]);
  const referenceHeader = findHeader(headers, ["reference", "reference number", "cheque no", "cheque number"]);
  const amountHeader = findHeader(headers, ["amount", "value", "net"]);
  const debitHeader = findHeader(headers, ["debit", "debits", "amount out", "withdrawal"]);
  const creditHeader = findHeader(headers, ["credit", "credits", "amount in", "deposit"]);
  if (!dateHeader || !descriptionHeader || (!amountHeader && !debitHeader && !creditHeader)) {
    throw new Error("CSV must contain date, description/narration, and amount or debit/credit columns");
  }

  const client = supabase();
  let count = 0;
  for (let index = 0; index < records.length; index += 500) {
    const batch = records.slice(index, index + 500).map((row) => ({
      import_id: importId,
      organization_id: organizationId,
      transaction_date: parseDate(row[dateHeader]),
      description: row[descriptionHeader]?.trim() || "Bank transaction",
      amount: amountHeader ? parseAmount(row[amountHeader]) : parseAmount(row[creditHeader!]) - parseAmount(row[debitHeader!]),
      currency_code: "UGX",
      reference: referenceHeader ? row[referenceHeader]?.trim() || null : null,
      status: "pending",
    }));
    const { error } = await client.from("books_bank_import_rows").insert(batch);
    if (error) throw error;
    count += batch.length;
  }
  return count;
}

async function createInvoicePdf(invoiceId: string): Promise<{ buffer: Buffer; fileName: string; recipient: string; subject: string }> {
  const client = supabase();
  const { data: invoice, error: invoiceError } = await client.from("books_invoices").select("id,invoice_number,issue_date,due_date,currency_code,subtotal,tax_amount,total,organization_id,contact_id").eq("id", invoiceId).single();
  if (invoiceError || !invoice) throw invoiceError || new Error("Invoice not found");
  if (!invoice.contact_id) throw new Error("Paid invoice has no customer contact");
  const [{ data: organization }, { data: contact }, { data: lines }] = await Promise.all([
    client.from("books_organizations").select("name,base_currency").eq("id", invoice.organization_id).single(),
    client.from("books_contacts").select("name,email,tax_id").eq("id", invoice.contact_id).single(),
    client.from("books_invoice_lines").select("description,quantity,unit_price,line_total").eq("invoice_id", invoice.id).order("created_at"),
  ]);
  if (!contact?.email) throw new Error("Invoice customer has no email address");

  const document = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];
  document.on("data", (chunk: Buffer) => chunks.push(chunk));
  const completed = new Promise<Buffer>((resolve, reject) => {
    document.once("end", () => resolve(Buffer.concat(chunks)));
    document.once("error", reject);
  });
  document.fontSize(22).text(organization?.name || "Business", { align: "right" });
  document.moveDown();
  document.fontSize(16).text(`Invoice ${invoice.invoice_number}`);
  document.fontSize(10).text(`Issued: ${invoice.issue_date}`).text(`Due: ${invoice.due_date}`);
  document.moveDown();
  document.fontSize(12).text(`Bill to: ${contact.name}`);
  if (contact.tax_id) document.fontSize(10).text(`Tax ID: ${contact.tax_id}`);
  document.moveDown();
  document.fontSize(11).text("Description").text("Amount", { align: "right" });
  for (const line of lines || []) {
    document.fontSize(10).text(`${line.description} (${line.quantity} × ${line.unit_price})`).text(`${line.line_total} ${invoice.currency_code}`, { align: "right" });
  }
  document.moveDown();
  document.text(`Subtotal: ${invoice.subtotal} ${invoice.currency_code}`, { align: "right" });
  document.text(`Tax: ${invoice.tax_amount} ${invoice.currency_code}`, { align: "right" });
  document.fontSize(13).text(`Total: ${invoice.total} ${invoice.currency_code}`, { align: "right" });
  document.end();
  return { buffer: await completed, fileName: `books/invoices/${invoice.organization_id}/${invoice.invoice_number}.pdf`, recipient: contact.email, subject: `Your Invoice Receipt - ${invoice.invoice_number}` };
}

async function sendBrevoEmail(recipient: string, subject: string, pdf: Buffer, fileName: string): Promise<void> {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": required("BREVO_API_KEY"), "content-type": "application/json" },
    body: JSON.stringify({
      sender: { email: process.env.BREVO_SENDER_EMAIL || "billing-test@yourplatform.com", name: process.env.BREVO_SENDER_NAME || "Books" },
      to: [{ email: recipient }],
      subject,
      htmlContent: "<p>Thank you. Your paid invoice is attached.</p>",
      attachment: [{ name: fileName.split("/").pop(), content: pdf.toString("base64") }],
    }),
  });
  if (!response.ok) throw new Error(`Brevo rejected the email (${response.status})`);
}

const runtimeSecrets = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_WEBHOOK_SECRET",
  "B2_ENDPOINT",
  "B2_REGION",
  "B2_KEY_ID",
  "B2_APPLICATION_KEY",
  "B2_BUCKET_NAME",
  "B2_PUBLIC_URL",
  "BREVO_API_KEY",
  "BREVO_SENDER_EMAIL",
  "BREVO_SENDER_NAME",
];

export const importBankCSV = onRequest({ region: "us-central1", timeoutSeconds: 540, memory: "1GiB", secrets: runtimeSecrets }, async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({ error: "POST required" });
    return;
  }
  const { value, raw } = jsonBody(request);
  try {
    verifyWebhook(request, raw);
    const payload = value as ImportPayload;
    if (!payload.importId || !payload.organizationId) throw new Error("importId and organizationId are required");
    const client = supabase();
    await client.from("books_bank_imports").update({ status: "processing", error_message: null }).eq("id", payload.importId).eq("organization_id", payload.organizationId);
    const rows = await insertBankRows(payload.importId, payload.organizationId, await readImportFile(payload));
    await client.from("books_bank_imports").update({ status: "ready" }).eq("id", payload.importId).eq("organization_id", payload.organizationId);
    response.json({ ok: true, rows });
    return;
  } catch (error) {
    const payload = value as ImportPayload;
    if (payload.importId && payload.organizationId) await supabase().from("books_bank_imports").update({ status: "failed", error_message: error instanceof Error ? error.message : "Import failed" }).eq("id", payload.importId).eq("organization_id", payload.organizationId);
    response.status(400).json({ error: error instanceof Error ? error.message : "Import failed" });
    return;
  }
});

export const generateAndSendInvoicePDF = onRequest({ region: "us-central1", timeoutSeconds: 120, memory: "512MiB", secrets: runtimeSecrets }, async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({ error: "POST required" });
    return;
  }
  const { value, raw } = jsonBody(request);
  try {
    verifyWebhook(request, raw);
    const payload = value as InvoicePayload;
    const invoiceId = payload.record?.id;
    if (!invoiceId || payload.record?.status !== "paid" || payload.old_record?.status === "paid") {
      response.json({ ok: true, skipped: true });
      return;
    }
    const document = await createInvoicePdf(invoiceId);
    await b2().send(new PutObjectCommand({ Bucket: bucket(), Key: document.fileName, Body: document.buffer, ContentType: "application/pdf" }));
    const publicUrl = process.env.B2_PUBLIC_URL ? `${process.env.B2_PUBLIC_URL.replace(/\/$/, "")}/${document.fileName}` : null;
    const client = supabase();
    const { error } = await client.from("books_invoices").update({ receipt_url: publicUrl, receipt_storage_key: document.fileName }).eq("id", invoiceId).eq("status", "paid");
    if (error) throw error;
    await sendBrevoEmail(document.recipient, document.subject, document.buffer, document.fileName);
    response.json({ ok: true, invoiceId, storageKey: document.fileName });
    return;
  } catch (error) {
    response.status(400).json({ error: error instanceof Error ? error.message : "Invoice delivery failed" });
    return;
  }
});
