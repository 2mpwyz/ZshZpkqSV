import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, ChefHat, Edit2, Eye, EyeOff, Plus, Trash2, Upload, Video, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { supabase } from "../lib/supabase";
import { menuItemFromDatabaseRow, MenuCategory, MenuItem } from "../lib/menuData";
import { getCachedHomeIdentity } from "../lib/homeIdentity";
import { useFileUpload } from "../hooks/useFileUpload";

const emptyForm = {
  name: "",
  description: "",
  description_full: "",
  currency: "USD",
  mediaType: "image" as "image" | "video",
  mediaUrl: "",
  mediaAttachmentId: "",
  price: "",
  originalPrice: "",
  category: "mains" as MenuCategory,
  image: "🍽️",
  cookTime: "15-20 min",
  dietary: "",
  calories: "",
  availability: "10",
  maxAvailability: "10",
  origin: "",
  chef_note: "",
  special_offer: "",
  statuses: "",
  isSpecial: false,
};

type FormState = typeof emptyForm;

type PendingMenuProvider = {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  service_type: string;
  menu_access_role: "chef" | "food_beverage_manager";
};

const MenuManagementPage = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [pendingProviders, setPendingProviders] = useState<PendingMenuProvider[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { uploadFile, isUploading } = useFileUpload();

  useEffect(() => {
    const loadAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthorized(false);
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role, menu_access_role, menu_access_approved")
        .eq("user_id", user.id)
        .maybeSingle();

      const cachedRole = getCachedHomeIdentity()?.role;
      const manager = profile?.role === "manager";
      const canManage = manager ||
        (profile?.role === "service_provider" &&
          profile.menu_access_approved === true &&
          (profile.menu_access_role === "chef" || profile.menu_access_role === "food_beverage_manager")) ||
        (!profile?.role && cachedRole === "manager");
      setIsManager(manager);
      setAuthorized(canManage);
      if (manager) {
        const { data: providers } = await supabase
          .from("user_profiles")
          .select("user_id, email, first_name, last_name, service_type, menu_access_role")
          .eq("role", "service_provider")
          .eq("menu_access_approved", false)
          .in("menu_access_role", ["chef", "food_beverage_manager"])
          .order("created_at", { ascending: true });
        setPendingProviders((providers || []) as PendingMenuProvider[]);
      }
      if (canManage) {
        const { data: databaseItems } = await supabase
          .from("menu_items")
          .select("*")
          .order("created_at", { ascending: true });
        setItems((databaseItems || []).map(menuItemFromDatabaseRow));
      }
    };

    loadAccess().catch(() => setAuthorized(false));
  }, []);

  useEffect(() => {
    if (authorized === false) navigate("/menu", { replace: true });
  }, [authorized, navigate]);

  if (authorized === null) {
    return <div className="min-h-screen" aria-busy="true" />;
  }

  if (!authorized) return null;

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleMediaFile = async (file?: File) => {
    if (!file) return;
    const uploaded = await uploadFile(file, "menu-items");
    if (!uploaded) return;
    setForm((current) => ({
      ...current,
      mediaType: uploaded.fileType === "video" ? "video" : "image",
      mediaUrl: uploaded.publicUrl,
      mediaAttachmentId: uploaded.attachmentId,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const editItem = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      description_full: item.description_full,
      currency: item.currency || "USD",
      mediaType: item.mediaType || "image",
      mediaUrl: item.mediaUrl || "",
      mediaAttachmentId: item.mediaAttachmentId || "",
      price: String(item.price),
      originalPrice: String(item.originalPrice),
      category: item.category,
      image: item.image,
      cookTime: item.cookTime,
      dietary: item.dietary.join(", "),
      calories: String(item.calories),
      availability: String(item.availability),
      maxAvailability: String(item.maxAvailability),
      origin: item.origin,
      chef_note: item.chef_note,
      special_offer: item.special_offer || "",
      statuses: item.statuses?.join(", ") || "",
      isSpecial: Boolean(item.special_offer),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    const price = Number(form.price);
    const originalPrice = Number(form.originalPrice) || price;
    const availability = Number(form.availability);
    const maxAvailability = Number(form.maxAvailability);

    if (!form.name.trim() || !form.description.trim() || !price || maxAvailability < 1) {
      setIsSaving(false);
      return;
    }

    const existingItem = editingId ? items.find((item) => item.id === editingId) : undefined;
    const nextItem: MenuItem = {
      id: editingId || `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      databaseId: existingItem?.databaseId,
      name: form.name.trim(),
      description: form.description.trim(),
      description_full: form.description_full.trim() || form.description.trim(),
      currency: form.currency,
      mediaType: form.mediaUrl ? form.mediaType : undefined,
      mediaUrl: form.mediaUrl || undefined,
      mediaAttachmentId: form.mediaAttachmentId || undefined,
      price,
      originalPrice: Math.max(price, originalPrice),
      category: form.category,
      image: form.image || "🍽️",
      cookTime: form.cookTime,
      difficulty: "medium",
      availability: Math.max(0, availability),
      maxAvailability,
      dietary: form.dietary.split(",").map((value) => value.trim()).filter(Boolean),
      spiceLevel: 0,
      popularity: 0,
      origin: form.origin.trim() || "Sheraton Kitchen",
      calories: Number(form.calories) || 0,
      chef_note: form.chef_note.trim(),
      special_offer: form.isSpecial ? form.special_offer.trim() || "Special offer" : null,
      statuses: form.statuses.split(",").map((value) => value.trim()).filter(Boolean),
      approved: true,
      trending: editingId ? items.find((item) => item.id === editingId)?.trending ?? false : false,
    };

    const databasePayload = {
      name: nextItem.name,
      short_description: nextItem.description,
      full_description: nextItem.description_full,
      currency: nextItem.currency || "USD",
      icon: nextItem.image,
      category: nextItem.category,
      price: nextItem.price,
      original_price: nextItem.originalPrice,
      preparation_time: nextItem.cookTime,
      origin: nextItem.origin,
      calories: nextItem.calories,
      dietary_tags: nextItem.dietary,
      spice_level: nextItem.spiceLevel,
      availability: nextItem.availability,
      max_availability: nextItem.maxAvailability,
      chef_note: nextItem.chef_note,
      special_offer: nextItem.special_offer,
      status_labels: nextItem.statuses || [],
      is_trending: nextItem.trending,
      is_published: nextItem.approved,
      media_type: nextItem.mediaType || null,
      media_url: nextItem.mediaUrl || null,
      media_attachment_id: nextItem.mediaAttachmentId || null,
      managed_by: (await supabase.auth.getUser()).data.user?.id,
    };

    const databaseQuery = nextItem.databaseId
      ? supabase
          .from("menu_items")
          .update(databasePayload)
          .eq("id", nextItem.databaseId)
          .select()
          .single()
      : supabase.from("menu_items").insert(databasePayload).select().single();
    const { data: savedDatabaseItem, error: databaseError } = await databaseQuery;

    if (databaseError || !savedDatabaseItem) {
      console.error("Unable to save menu item to Supabase", databaseError);
      setIsSaving(false);
      return;
    }

    const savedItem = menuItemFromDatabaseRow(savedDatabaseItem);
    setItems((current) => editingId
      ? current.map((item) => item.id === editingId ? savedItem : item)
      : [...current, savedItem]);
    setIsSaving(false);
    resetForm();
  };

  const approveProvider = async (userId: string) => {
    const { error } = await supabase.rpc("approve_menu_access", {
      target_user_id: userId,
    });

    if (!error) {
      setPendingProviders((current) => current.filter((provider) => provider.user_id !== userId));
    }
  };

  const toggleTrending = async (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (!item?.databaseId) return;

    const { error } = await supabase
      .from("menu_items")
      .update({ is_trending: !item.trending })
      .eq("id", item.databaseId);

    if (!error) {
      setItems((current) => current.map((entry) => entry.id === id ? { ...entry, trending: !item.trending } : entry));
    }
  };

  const toggleVisibility = async (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (!item?.databaseId) return;

    const { error } = await supabase
      .from("menu_items")
      .update({ is_published: !item.approved })
      .eq("id", item.databaseId);

    if (!error) {
      setItems((current) => current.map((entry) => entry.id === id ? { ...entry, approved: !item.approved } : entry));
    }
  };

  const removeItem = async (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (!item?.databaseId) return;

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", item.databaseId);

    if (!error) {
      setItems((current) => current.filter((entry) => entry.id !== id));
      if (editingId === id) resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <button onClick={() => navigate("/staff")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Staff Portal
            </button>
            <div className="flex items-center gap-3">
              <ChefHat className="h-8 w-8 text-sheraton-gold" />
              <div>
                <h1 className="text-3xl font-bold">Digital Menu Management</h1>
                <p className="text-muted-foreground">Create, update, and publish dishes shown to guests.</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/menu")}>View Guest Menu</Button>
        </div>

        {isManager && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Menu Access Approvals</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review culinary staff before granting menu modification access.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingProviders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending culinary access requests.</p>
              ) : (
                pendingProviders.map((provider) => (
                  <div key={provider.user_id} className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{[provider.first_name, provider.last_name].filter(Boolean).join(" ") || provider.email}</p>
                      <p className="text-sm text-muted-foreground">{provider.email} · {provider.service_type || "Food service"}</p>
                      <Badge variant="outline" className="mt-2">{provider.menu_access_role === "chef" ? "Chef / Culinary Staff" : "Food & Beverage Manager"}</Badge>
                    </div>
                    <Button type="button" onClick={() => approveProvider(provider.user_id)}>Approve Menu Access</Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingId ? "Edit Dish" : "Add Dish"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveItem} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2"><Label htmlFor="name">Dish name *</Label><Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="image">Dish icon</Label><select id="image" className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.image} onChange={(e) => updateField("image", e.target.value)}><option value="🍽️">🍽️ General dish</option><option value="🍝">🍝 Pasta</option><option value="🥩">🥩 Steak</option><option value="🦞">🦞 Seafood</option><option value="🍲">🍲 Soup</option><option value="🍕">🍕 Pizza</option><option value="🥗">🥗 Salad</option><option value="🍔">🍔 Burger</option><option value="🍰">🍰 Dessert</option><option value="🍫">🍫 Chocolate</option><option value="🍸">🍸 Cocktail</option><option value="🍉">🍉 Fruit</option><option value="☕">☕ Coffee</option></select></div>
              <div className="space-y-2"><Label htmlFor="currency">Currency</Label><select id="currency" className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.currency} onChange={(e) => updateField("currency", e.target.value)}><option value="USD">USD — US Dollar ($)</option><option value="EUR">EUR — Euro (€)</option><option value="GBP">GBP — British Pound (£)</option><option value="CAD">CAD — Canadian Dollar ($)</option><option value="AUD">AUD — Australian Dollar ($)</option><option value="JPY">JPY — Japanese Yen (¥)</option><option value="CHF">CHF — Swiss Franc</option><option value="CNY">CNY — Chinese Yuan (¥)</option><option value="INR">INR — Indian Rupee (₹)</option><option value="RWF">RWF — Rwandan Franc</option><option value="KES">KES — Kenyan Shilling</option><option value="TZS">TZS — Tanzanian Shilling</option><option value="CDF">CDF — Congolese Franc</option><option value="UGX">UGX — Ugandan Shilling</option><option value="ZAR">ZAR — South African Rand</option><option value="AED">AED — UAE Dirham</option><option value="SGD">SGD — Singapore Dollar</option></select></div>
              <div className="space-y-2"><Label htmlFor="price">Current price *</Label><Input id="price" type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => updateField("price", e.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="originalPrice">Original price</Label><Input id="originalPrice" type="number" min="0.01" step="0.01" placeholder="Use for discounts" value={form.originalPrice} onChange={(e) => updateField("originalPrice", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="cookTime">Preparation time</Label><Input id="cookTime" value={form.cookTime} onChange={(e) => updateField("cookTime", e.target.value)} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Dish media</Label><div className="flex flex-wrap gap-3"><label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-accent"><Upload className="h-4 w-4" /> {isUploading ? "Uploading..." : "Upload image/video"}<input className="sr-only" type="file" accept="image/*,video/*" onChange={(e) => handleMediaFile(e.target.files?.[0])} /></label><label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-accent"><Camera className="h-4 w-4" /> Take photo<input className="sr-only" type="file" accept="image/*" capture="environment" onChange={(e) => handleMediaFile(e.target.files?.[0])} /></label><label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-accent"><Video className="h-4 w-4" /> Record video<input className="sr-only" type="file" accept="video/*" capture="environment" onChange={(e) => handleMediaFile(e.target.files?.[0])} /></label></div>{form.mediaUrl && <div className="relative mt-3 w-fit"><div className="flex items-center gap-2 rounded-md border p-2">{form.mediaType === "video" ? <video src={form.mediaUrl} className="h-24 w-32 rounded object-cover" muted /> : <img src={form.mediaUrl} alt="Dish preview" className="h-24 w-32 rounded object-cover" />}<Badge variant="outline">{form.mediaType === "video" ? "Video" : "Image"}</Badge><Button type="button" size="icon" variant="ghost" className="text-destructive" aria-label="Remove selected media" onClick={() => setForm((current) => ({ ...current, mediaUrl: "", mediaType: "image" }))}><X className="h-4 w-4" /></Button></div></div>}</div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Short description *</Label><Input id="description" value={form.description} onChange={(e) => updateField("description", e.target.value)} required /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="description_full">Full description</Label><Textarea id="description_full" value={form.description_full} onChange={(e) => updateField("description_full", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="category">Category</Label><select id="category" className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={form.category} onChange={(e) => updateField("category", e.target.value)}><option value="appetizers">Appetizers</option><option value="mains">Main Courses</option><option value="desserts">Desserts</option><option value="beverages">Beverages</option><option value="special">Special Offers</option></select></div>
              <div className="space-y-2"><Label htmlFor="origin">Origin</Label><Input id="origin" value={form.origin} onChange={(e) => updateField("origin", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="dietary">Dietary tags</Label><Input id="dietary" placeholder="vegetarian, gluten-free" value={form.dietary} onChange={(e) => updateField("dietary", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="calories">Calories</Label><Input id="calories" type="number" min="0" value={form.calories} onChange={(e) => updateField("calories", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="availability">Available portions</Label><Input id="availability" type="number" min="0" value={form.availability} onChange={(e) => updateField("availability", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="maxAvailability">Maximum portions *</Label><Input id="maxAvailability" type="number" min="1" value={form.maxAvailability} onChange={(e) => updateField("maxAvailability", e.target.value)} required /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="chef_note">Chef note</Label><Input id="chef_note" value={form.chef_note} onChange={(e) => updateField("chef_note", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="statuses">Status labels</Label><Input id="statuses" placeholder="Available, Chef's Pick" value={form.statuses} onChange={(e) => updateField("statuses", e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="special_offer">Promotion label</Label><Input id="special_offer" placeholder="20% off, Happy Hour" value={form.special_offer} onChange={(e) => updateField("special_offer", e.target.value)} /></div>
              <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" checked={form.isSpecial} onChange={(e) => setForm((current) => ({ ...current, isSpecial: e.target.checked }))} /> Mark this dish as Special</label>
              <div className="md:col-span-2 flex gap-3"><Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : editingId ? "Save Changes" : "Publish Dish"}</Button>{editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}</div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Published and Draft Dishes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3"><span className="text-3xl">{item.image}</span><div><p className="font-semibold">{item.name}</p><p className="text-sm text-muted-foreground">{item.category} · {item.currency || "USD"} {item.price.toFixed(2)} · {item.availability}/{item.maxAvailability} available</p></div></div>
                <div className="flex items-center gap-2"><Badge variant={item.approved ? "default" : "outline"}>{item.approved ? "Published" : "Hidden"}</Badge>{item.trending && <Badge className="bg-red-100 text-red-700">Trending</Badge>}<Button size="sm" variant="outline" onClick={() => editItem(item)}><Edit2 className="h-4 w-4 mr-1" /> Edit</Button><Button size="sm" variant="outline" onClick={() => toggleTrending(item.id)}>{item.trending ? "Remove Trending" : "Mark Trending"}</Button><Button size="sm" variant="outline" onClick={() => toggleVisibility(item.id)}>{item.approved ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}{item.approved ? "Hide" : "Publish"}</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MenuManagementPage;
