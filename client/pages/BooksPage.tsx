import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, Cloud, FileText, Link2, Loader2, RefreshCw, ShieldCheck, Unplug, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { supabase } from "../lib/supabase";

type Status = { connected: boolean; organizationId: string | null; connectedAt: string | null };
type BooksData = { invoices: Array<{ invoice_id: string; invoice_number?: string; customer_name?: string; total?: number; status?: string; due_date?: string }>; contacts: Array<{ contact_id: string; contact_name?: string; company_name?: string }>; organizationId: string };

const getToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

const BooksPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status | null>(null);
  const [data, setData] = useState<BooksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const token = await getToken();
    if (!token) {
      navigate(`/login?returnTo=${encodeURIComponent("/books")}`, { replace: true });
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const statusResponse = await fetch("/api/zoho/books/status", { headers });
    const statusBody = await statusResponse.json();
    if (!statusResponse.ok) throw new Error(statusBody.error || "Unable to load Books status");
    setStatus(statusBody);

    if (statusBody.connected) {
      const dataResponse = await fetch("/api/zoho/books/data", { headers });
      const dataBody = await dataResponse.json();
      if (!dataResponse.ok) throw new Error(dataBody.error || "Unable to load Zoho Books data");
      setData(dataBody);
    } else {
      setData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (searchParams.get("error")) setError("Zoho authorization was not completed. You can try connecting again.");
    load().catch((reason) => {
      setError(reason instanceof Error ? reason.message : "Unable to load Books");
      setLoading(false);
    });
  }, [navigate, searchParams]);

  const connect = async () => {
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        navigate(`/login?returnTo=${encodeURIComponent("/books")}`);
        return;
      }
      const returnTo = window.location.href;
      const response = await fetch(
        `/api/zoho/books/connect?${new URLSearchParams({ returnTo })}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const body = await response.json();
      if (!response.ok || !body.url) throw new Error(body.error || "Unable to start Zoho authorization");
      setAuthorizationUrl(body.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to connect Zoho Books");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    try {
      const token = await getToken();
      const response = await fetch("/api/zoho/books/disconnect", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to disconnect Zoho Books");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to disconnect Zoho Books");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-sheraton-gold" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sheraton-cream to-background">
      <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sheraton-gold/15 px-3 py-1 text-sm font-medium text-sheraton-navy"><BookOpen className="h-4 w-4" /> Finance workspace</div>
            <h1 className="text-3xl font-bold text-sheraton-navy sm:text-4xl">Books</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">Connect Zoho Books to keep invoices, contacts, and operational finance activity in one organised workspace.</p>
          </div>
          {status?.connected && <Button variant="outline" onClick={disconnect} disabled={busy}><Unplug className="mr-2 h-4 w-4" /> Disconnect</Button>}
        </div>

        {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {!status?.connected ? (
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardContent className="grid gap-8 p-8 md:grid-cols-[1.2fr_.8fr] md:p-12">
              <div>
                <Badge className="mb-5 bg-sheraton-gold text-sheraton-navy"><Cloud className="mr-1 h-3.5 w-3.5" /> Not connected</Badge>
                <h2 className="text-2xl font-semibold text-sheraton-navy">Bring your accounting into focus</h2>
                <p className="mt-3 text-muted-foreground">Authorise this workspace to securely read your Zoho Books organisation, invoices, and contacts. Tokens are exchanged and stored on the server.</p>
                {authorizationUrl ? (
                  <a
                    className="mt-7 inline-flex items-center rounded-md bg-gradient-to-r from-sheraton-gold to-sheraton-gold/80 px-4 py-2 text-sm font-medium text-white shadow transition hover:opacity-90"
                    href={authorizationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Link2 className="mr-2 h-4 w-4" /> Continue to Zoho Books <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                ) : (
                  <Button className="mt-7 sheraton-gradient text-white" onClick={connect} disabled={busy}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />} Connect Zoho Books <ArrowRight className="ml-2 h-4 w-4" /></Button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
                {[{ icon: ShieldCheck, title: "Secure OAuth", text: "No Zoho secrets in the browser." }, { icon: FileText, title: "Invoice visibility", text: "Review recent billing activity." }, { icon: Users, title: "Contact sync", text: "Keep operational contacts accessible." }].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-xl bg-sheraton-pearl/60 p-4"><Icon className="h-5 w-5 text-sheraton-gold" /><p className="mt-2 font-medium text-sheraton-navy">{title}</p><p className="mt-1 text-xs text-muted-foreground">{text}</p></div>)}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 className="h-5 w-5" /> Connected to Zoho Books{status.organizationId ? ` · Organisation ${status.organizationId}` : ""}<Button variant="ghost" size="sm" className="ml-auto" onClick={() => load()}><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button></div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-sheraton-gold" /> Recent invoices</CardTitle></CardHeader><CardContent>{data?.invoices.length ? <div className="space-y-3">{data.invoices.map((invoice) => <div key={invoice.invoice_id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium text-sheraton-navy">{invoice.invoice_number || "Invoice"}</p><p className="text-xs text-muted-foreground">{invoice.customer_name || "Customer"} · {invoice.status || "Unknown status"}</p></div><span className="font-semibold">{invoice.total ?? "—"}</span></div>)}</div> : <p className="text-sm text-muted-foreground">No invoices were returned by Zoho Books.</p>}</CardContent></Card>
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-sheraton-gold" /> Contacts</CardTitle></CardHeader><CardContent>{data?.contacts.length ? <div className="space-y-3">{data.contacts.map((contact) => <div key={contact.contact_id} className="rounded-lg border p-3"><p className="font-medium text-sheraton-navy">{contact.contact_name || contact.company_name || "Contact"}</p><p className="text-xs text-muted-foreground">{contact.company_name || "Zoho Books contact"}</p></div>)}</div> : <p className="text-sm text-muted-foreground">No contacts were returned by Zoho Books.</p>}</CardContent></Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BooksPage;
