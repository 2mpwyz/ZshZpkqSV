import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import {
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CircleDollarSign,
  FileText,
  Plus,
  Receipt,
  RefreshCw,
  Users,
} from "lucide-react";

type Contact = { id: string; name: string; type: "customer" | "vendor" | "both"; email: string | null; tax_id: string | null };
type Invoice = { id: string; invoice_number: string; contact_id: string | null; issue_date: string; due_date: string; currency_code: string; subtotal: number; tax_amount: number; total: number; status: "draft" | "sent" | "paid" | "overdue" | "void" };
type Expense = { id: string; description: string; contact_id: string | null; expense_date: string; currency_code: string; amount: number; tax_amount: number; payment_status: "paid" | "unpaid" };
type Account = { id: string; code: string; name: string; type: "asset" | "liability" | "equity" | "income" | "expense" };
type TaxRate = { id: string; name: string; country_code: string; rate_percentage: number };
type LedgerLine = { account_id: string; debit: number; credit: number; currency_code: string; transaction_date: string };

const today = new Date().toISOString().slice(0, 10);
const formatMoney = (value: number, currency: string) => new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(value || 0);

const BooksPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [currency, setCurrency] = useState("UGX");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [ledgerLines, setLedgerLines] = useState<LedgerLine[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", type: "customer" as Contact["type"], email: "", tax_id: "" });
  const [invoiceForm, setInvoiceForm] = useState({ invoice_number: "", contact_id: "", issue_date: today, due_date: today, subtotal: "", tax_rate_id: "" });
  const [expenseForm, setExpenseForm] = useState({ description: "", contact_id: "", expense_date: today, amount: "", tax_amount: "" });

  const loadBooks = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      navigate(`/login?returnTo=${encodeURIComponent("/books")}`, { replace: true });
      return;
    }
    const { data: orgId, error: orgError } = await supabase.rpc("get_or_create_books_organization");
    if (orgError) {
      toast({ title: "Books needs its database setup", description: orgError.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setOrganizationId(orgId);
    const [org, contactResult, invoiceResult, expenseResult, accountResult, taxResult, transactionResult] = await Promise.all([
      supabase.from("books_organizations").select("base_currency").eq("id", orgId).single(),
      supabase.from("books_contacts").select("id,name,type,email,tax_id").eq("organization_id", orgId).order("name"),
      supabase.from("books_invoices").select("id,invoice_number,contact_id,issue_date,due_date,currency_code,subtotal,tax_amount,total,status").eq("organization_id", orgId).order("issue_date", { ascending: false }),
      supabase.from("books_expenses").select("id,description,contact_id,expense_date,currency_code,amount,tax_amount,payment_status").eq("organization_id", orgId).order("expense_date", { ascending: false }),
      supabase.from("books_accounts").select("id,code,name,type").eq("organization_id", orgId).order("code"),
      supabase.from("books_tax_rates").select("id,name,country_code,rate_percentage").eq("organization_id", orgId).eq("is_active", true).order("name"),
      supabase.from("books_journal_transactions").select("id,transaction_date,books_journal_lines(account_id,debit,credit,currency_code)").eq("organization_id", orgId).order("transaction_date", { ascending: false }),
    ]);
    if (org.data?.base_currency) setCurrency(org.data.base_currency.trim());
    setContacts((contactResult.data || []) as Contact[]);
    setInvoices((invoiceResult.data || []) as Invoice[]);
    setExpenses((expenseResult.data || []) as Expense[]);
    setAccounts((accountResult.data || []) as Account[]);
    setTaxRates((taxResult.data || []) as TaxRate[]);
    const transactions = (transactionResult.data || []) as Array<{ id: string; transaction_date: string; books_journal_lines: Array<{ account_id: string; debit: number; credit: number; currency_code: string }> }>;
    setLedgerLines(transactions.flatMap((transaction) => transaction.books_journal_lines.map((line) => ({ ...line, transaction_date: transaction.transaction_date }))));
    setLoading(false);
  };

  useEffect(() => { void loadBooks(); }, []);

  const customerContacts = contacts.filter((contact) => contact.type === "customer" || contact.type === "both");
  const vendorContacts = contacts.filter((contact) => contact.type === "vendor" || contact.type === "both");
  const accountById = new Map(accounts.map((account) => [account.id, account]));
  const ledgerTotal = (type: Account["type"], side: "debit" | "credit") => ledgerLines.reduce((sum, line) => {
    const account = accountById.get(line.account_id);
    return account?.type === type ? sum + Number(line[side]) : sum;
  }, 0);
  const revenue = ledgerTotal("income", "credit") || invoices.filter((invoice) => invoice.status !== "void").reduce((sum, invoice) => sum + Number(invoice.subtotal), 0);
  const expensesTotal = ledgerTotal("expense", "debit") || expenses.reduce((sum, expense) => sum + Number(expense.amount) + Number(expense.tax_amount), 0);
  const assets = ledgerTotal("asset", "debit") - ledgerTotal("asset", "credit");
  const liabilities = ledgerTotal("liability", "credit") - ledgerTotal("liability", "debit");
  const equity = ledgerTotal("equity", "credit") - ledgerTotal("equity", "debit") + revenue - expensesTotal;
  const receivable = invoices.filter((invoice) => invoice.status !== "paid" && invoice.status !== "void").reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const overdue = invoices.filter((invoice) => invoice.status === "overdue" || (invoice.status !== "paid" && invoice.due_date < today)).length;
  const contactName = (id: string | null) => contacts.find((contact) => contact.id === id)?.name || "Unassigned";
  const profit = revenue - expensesTotal;

  const saveContact = async (event: FormEvent) => {
    event.preventDefault();
    if (!organizationId || !contactForm.name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("books_contacts").insert({ organization_id: organizationId, name: contactForm.name.trim(), type: contactForm.type, email: contactForm.email.trim() || null, tax_id: contactForm.tax_id.trim() || null });
    setSaving(false);
    if (error) { toast({ title: "Could not save contact", description: error.message, variant: "destructive" }); return; }
    setContactForm({ name: "", type: "customer", email: "", tax_id: "" });
    toast({ title: "Contact added" });
    await loadBooks();
  };

  const saveInvoice = async (event: FormEvent) => {
    event.preventDefault();
    if (!organizationId || !invoiceForm.invoice_number.trim() || !invoiceForm.subtotal) return;
    setSaving(true);
    const selectedRate = taxRates.find((rate) => rate.id === invoiceForm.tax_rate_id);
    const { error } = await supabase.from("books_invoices").insert({ organization_id: organizationId, invoice_number: invoiceForm.invoice_number.trim(), contact_id: invoiceForm.contact_id || null, issue_date: invoiceForm.issue_date, due_date: invoiceForm.due_date, currency_code: currency, subtotal: Number(invoiceForm.subtotal), tax_rate_id: invoiceForm.tax_rate_id || null, tax_rate_percentage: selectedRate?.rate_percentage || 0, status: "draft" });
    setSaving(false);
    if (error) { toast({ title: "Could not save invoice", description: error.message, variant: "destructive" }); return; }
    setInvoiceForm({ invoice_number: "", contact_id: "", issue_date: today, due_date: today, subtotal: "", tax_rate_id: "" });
    toast({ title: "Invoice saved", description: "The invoice is ready to review and send." });
    await loadBooks();
  };

  const saveExpense = async (event: FormEvent) => {
    event.preventDefault();
    if (!organizationId || !expenseForm.description.trim() || !expenseForm.amount) return;
    setSaving(true);
    const { error } = await supabase.from("books_expenses").insert({ organization_id: organizationId, description: expenseForm.description.trim(), contact_id: expenseForm.contact_id || null, expense_date: expenseForm.expense_date, currency_code: currency, amount: Number(expenseForm.amount), tax_amount: Number(expenseForm.tax_amount || 0), payment_status: "paid" });
    setSaving(false);
    if (error) { toast({ title: "Could not save expense", description: error.message, variant: "destructive" }); return; }
    setExpenseForm({ description: "", contact_id: "", expense_date: today, amount: "", tax_amount: "" });
    toast({ title: "Expense recorded" });
    await loadBooks();
  };

  const markLatestInvoicePaid = async () => {
    const invoice = invoices.find((item) => item.status !== "paid" && item.status !== "void");
    if (!invoice) {
      toast({ title: "No open invoice", description: "Create an invoice first." });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("books_invoices").update({ status: "paid" }).eq("id", invoice.id).eq("organization_id", organizationId);
    setSaving(false);
    if (error) {
      toast({ title: "Could not mark invoice paid", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Invoice marked paid", description: "The ledger trigger and paid-invoice webhook can now process it." });
    await loadBooks();
  };

  if (loading) return <div className="min-h-screen bg-sheraton-cream/30 p-8"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-12 rounded bg-muted" /><div className="h-40 rounded bg-muted" /><div className="h-64 rounded bg-muted" /></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sheraton-cream/70 to-background">
      <div className="container max-w-7xl py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><div className="mb-3 flex items-center gap-2"><BookOpen className="h-7 w-7 text-sheraton-gold" /><Badge className="bg-sheraton-gold text-sheraton-navy">Books</Badge></div><h1 className="text-4xl font-bold text-sheraton-navy">Your business finances</h1><p className="mt-2 max-w-2xl text-muted-foreground">Customers, invoices, expenses and financial reports in one secure workspace. Your records stay in your platform and are isolated by business.</p></div>
          <div className="flex gap-2"><Button variant="outline" onClick={() => void loadBooks()}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button><Button variant="outline" onClick={() => void markLatestInvoicePaid()} disabled={saving}>Mark open invoice paid</Button></div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 md:grid-cols-6"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="contacts">Contacts</TabsTrigger><TabsTrigger value="invoices">Invoices</TabsTrigger><TabsTrigger value="expenses">Expenses</TabsTrigger><TabsTrigger value="reports">Reports</TabsTrigger><TabsTrigger value="accounts">Chart of accounts</TabsTrigger></TabsList>
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Income" value={formatMoney(revenue, currency)} icon={<ArrowUpRight className="h-5 w-5" />} tone="green" /><Metric label="Expenses" value={formatMoney(expensesTotal, currency)} icon={<ArrowDownToLine className="h-5 w-5" />} tone="red" /><Metric label="Receivables" value={formatMoney(receivable, currency)} icon={<CircleDollarSign className="h-5 w-5" />} tone="gold" /><Metric label="Net result" value={formatMoney(profit, currency)} icon={<BarChart3 className="h-5 w-5" />} tone={profit >= 0 ? "green" : "red"} /></div>
            <div className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]"><Card><CardHeader><CardTitle>Get started</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><QuickAction icon={<Users />} title="Add a contact" text="Customers and vendors" onClick={() => setActiveTab("contacts")} /><QuickAction icon={<FileText />} title="Create an invoice" text="Track money owed" onClick={() => setActiveTab("invoices")} /><QuickAction icon={<Receipt />} title="Record an expense" text="Keep costs current" onClick={() => setActiveTab("expenses")} /></CardContent></Card><Card><CardHeader><CardTitle>Attention needed</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p>{overdue ? `${overdue} invoice${overdue === 1 ? "" : "s"} need follow-up.` : "No overdue invoices."}</p><p>{customerContacts.length} customer contacts and {vendorContacts.length} vendors are in your books.</p><Button variant="link" className="px-0" onClick={() => setActiveTab("reports")}>View financial reports →</Button></CardContent></Card></div>
          </TabsContent>
          <TabsContent value="contacts" className="space-y-6"><Card><CardHeader><CardTitle>Add customer or vendor</CardTitle></CardHeader><CardContent><form onSubmit={saveContact} className="grid gap-4 md:grid-cols-5"><div className="space-y-2 md:col-span-2"><Label>Name *</Label><Input value={contactForm.name} onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })} placeholder="Business or person" required /></div><div className="space-y-2"><Label>Type</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={contactForm.type} onChange={(event) => setContactForm({ ...contactForm, type: event.target.value as Contact["type"] })}><option value="customer">Customer</option><option value="vendor">Vendor</option><option value="both">Both</option></select></div><div className="space-y-2"><Label>Email</Label><Input type="email" value={contactForm.email} onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })} /></div><div className="flex items-end"><Button className="w-full sheraton-gradient text-white" disabled={saving}><Plus className="mr-2 h-4 w-4" />Add contact</Button></div></form></CardContent></Card><DataTable headers={["Name", "Type", "Email", "Tax ID"]}>{contacts.map((contact) => <tr key={contact.id} className="border-b"><td className="p-4 font-medium">{contact.name}</td><td className="p-4"><Badge variant="outline">{contact.type}</Badge></td><td className="p-4 text-muted-foreground">{contact.email || "—"}</td><td className="p-4 text-muted-foreground">{contact.tax_id || "—"}</td></tr>)}</DataTable></TabsContent>
          <TabsContent value="invoices" className="space-y-6"><EntryCard title="Create invoice" onSubmit={saveInvoice} saving={saving}><div className="grid gap-4 md:grid-cols-6"><Field label="Invoice number"><Input value={invoiceForm.invoice_number} onChange={(event) => setInvoiceForm({ ...invoiceForm, invoice_number: event.target.value })} placeholder="INV-0001" required /></Field><Field label="Customer"><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={invoiceForm.contact_id} onChange={(event) => setInvoiceForm({ ...invoiceForm, contact_id: event.target.value })}><option value="">Select customer</option>{customerContacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}</select></Field><Field label="Issue date"><Input type="date" value={invoiceForm.issue_date} onChange={(event) => setInvoiceForm({ ...invoiceForm, issue_date: event.target.value })} /></Field><Field label="Due date"><Input type="date" value={invoiceForm.due_date} onChange={(event) => setInvoiceForm({ ...invoiceForm, due_date: event.target.value })} /></Field><Field label={`Subtotal (${currency})`}><Input type="number" min="0" step="0.01" value={invoiceForm.subtotal} onChange={(event) => setInvoiceForm({ ...invoiceForm, subtotal: event.target.value })} required /></Field><Field label="Tax rate"><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={invoiceForm.tax_rate_id} onChange={(event) => setInvoiceForm({ ...invoiceForm, tax_rate_id: event.target.value })}><option value="">No tax</option>{taxRates.map((rate) => <option key={rate.id} value={rate.id}>{rate.name} ({rate.rate_percentage}%)</option>)}</select></Field></div></EntryCard><DataTable headers={["Invoice", "Customer", "Issue date", "Due date", "Total", "Status"]}>{invoices.map((invoice) => <tr key={invoice.id} className="border-b"><td className="p-4 font-medium">{invoice.invoice_number}</td><td className="p-4">{contactName(invoice.contact_id)}</td><td className="p-4">{invoice.issue_date}</td><td className="p-4">{invoice.due_date}</td><td className="p-4 font-semibold">{formatMoney(Number(invoice.total), invoice.currency_code.trim())}</td><td className="p-4"><Badge variant={invoice.status === "paid" ? "default" : "outline"}>{invoice.status}</Badge></td></tr>)}</DataTable></TabsContent>
          <TabsContent value="expenses" className="space-y-6"><EntryCard title="Record expense" onSubmit={saveExpense} saving={saving}><div className="grid gap-4 md:grid-cols-5"><Field label="Description"><Input value={expenseForm.description} onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })} placeholder="Internet, rent, supplies" required /></Field><Field label="Vendor"><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={expenseForm.contact_id} onChange={(event) => setExpenseForm({ ...expenseForm, contact_id: event.target.value })}><option value="">Select vendor</option>{vendorContacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}</select></Field><Field label="Date"><Input type="date" value={expenseForm.expense_date} onChange={(event) => setExpenseForm({ ...expenseForm, expense_date: event.target.value })} /></Field><Field label={`Amount (${currency})`}><Input type="number" min="0" step="0.01" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} required /></Field><Field label={`Tax (${currency})`}><Input type="number" min="0" step="0.01" value={expenseForm.tax_amount} onChange={(event) => setExpenseForm({ ...expenseForm, tax_amount: event.target.value })} /></Field></div></EntryCard><DataTable headers={["Description", "Vendor", "Date", "Amount", "Payment"]}>{expenses.map((expense) => <tr key={expense.id} className="border-b"><td className="p-4 font-medium">{expense.description}</td><td className="p-4">{contactName(expense.contact_id)}</td><td className="p-4">{expense.expense_date}</td><td className="p-4 font-semibold">{formatMoney(Number(expense.amount) + Number(expense.tax_amount), expense.currency_code.trim())}</td><td className="p-4"><Badge variant="outline">{expense.payment_status}</Badge></td></tr>)}</DataTable></TabsContent>
          <TabsContent value="reports" className="space-y-6"><div className="grid gap-6 lg:grid-cols-3"><ReportCard title="Profit & loss" rows={[["Income", revenue], ["Expenses", expensesTotal], ["Net result", profit]]} currency={currency} /><ReportCard title="Balance sheet" rows={[["Assets", assets], ["Liabilities", liabilities], ["Equity", equity]]} currency={currency} /><ReportCard title="Receivables" rows={[["Open invoices", receivable], ["Paid invoices", invoices.filter((invoice) => invoice.status === "paid").reduce((sum, invoice) => sum + Number(invoice.total), 0)]]} currency={currency} /></div><Card><CardHeader><CardTitle>Ledger-backed reporting</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Reports are calculated from immutable journal lines created automatically when expenses are recorded and invoices are paid. The balance sheet follows Assets = Liabilities + Equity.</CardContent></Card></TabsContent>
          <TabsContent value="accounts"><Card><CardHeader><CardTitle>Chart of accounts</CardTitle></CardHeader><CardContent>{accounts.length ? <DataTable headers={["Code", "Account", "Type"]}>{accounts.map((account) => <tr key={account.id} className="border-b"><td className="p-4 font-mono">{account.code}</td><td className="p-4 font-medium">{account.name}</td><td className="p-4"><Badge variant="outline">{account.type}</Badge></td></tr>)}</DataTable> : <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">Your chart of accounts will appear here once your Books workspace is initialized.</div>}</CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Metric = ({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: "green" | "red" | "gold" }) => <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold text-sheraton-navy">{value}</p></div><span className={`rounded-full p-3 ${tone === "green" ? "bg-green-100 text-green-700" : tone === "red" ? "bg-red-100 text-red-700" : "bg-sheraton-gold/20 text-sheraton-gold"}`}>{icon}</span></CardContent></Card>;
const QuickAction = ({ icon, title, text, onClick }: { icon: React.ReactNode; title: string; text: string; onClick: () => void }) => <button onClick={onClick} className="rounded-lg border p-4 text-left transition-colors hover:bg-muted"><span className="mb-3 block text-sheraton-gold">{icon}</span><span className="block font-semibold">{title}</span><span className="text-sm text-muted-foreground">{text}</span></button>;
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <div className="space-y-2"><Label>{label}</Label>{children}</div>;
const EntryCard = ({ title, onSubmit, saving, children }: { title: string; onSubmit: (event: FormEvent) => void; saving: boolean; children: React.ReactNode }) => <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><form onSubmit={onSubmit} className="space-y-4">{children}<Button className="sheraton-gradient text-white" disabled={saving}><Plus className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save"}</Button></form></CardContent></Card>;
const DataTable = ({ headers, children }: { headers: string[]; children: React.ReactNode }) => <Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full min-w-[650px]"><thead><tr className="border-b bg-muted/30">{headers.map((header) => <th key={header} className="p-4 text-left text-sm font-semibold">{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div></CardContent></Card>;
const ReportCard = ({ title, rows, currency }: { title: string; rows: [string, number][]; currency: string }) => <Card><CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader><CardContent className="space-y-3">{rows.map(([label, value]) => <div key={label} className="flex justify-between border-b pb-2 text-sm last:border-0"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{formatMoney(value, currency)}</span></div>)}</CardContent></Card>;

export default BooksPage;
