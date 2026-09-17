import { supabase } from "./supabase";

export type MenuCartItemInput = {
  menuItemId: string;
  quantity: number;
  unitPrice: number;
};

export type DurableMenuCart = {
  id: string;
  items: Array<{ menu_item_id: string; quantity: number }>;
};

export const loadActiveMenuCart = async (): Promise<DurableMenuCart | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: cart, error: cartError } = await supabase
    .from("menu_carts")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (cartError) throw cartError;
  if (!cart) return null;

  const { data: items, error: itemsError } = await supabase
    .from("menu_cart_items")
    .select("menu_item_id, quantity")
    .eq("cart_id", cart.id);

  if (itemsError) throw itemsError;

  return { id: cart.id, items: items || [] };
};

export const syncActiveMenuCart = async (
  cartId: string | null,
  items: MenuCartItemInput[],
): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to save your cart.");

  let activeCartId = cartId;
  if (!activeCartId) {
    const { data: existingCart, error: existingCartError } = await supabase
      .from("menu_carts")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (existingCartError) throw existingCartError;

    if (existingCart) {
      activeCartId = existingCart.id;
    } else {
      const { data: createdCart, error: createCartError } = await supabase
        .from("menu_carts")
        .insert({ user_id: user.id, status: "active" })
        .select("id")
        .single();

      if (createCartError || !createdCart) throw createCartError || new Error("Unable to create menu cart");
      activeCartId = createdCart.id;
    }
  }

  const { data: existingItems, error: existingItemsError } = await supabase
    .from("menu_cart_items")
    .select("id, menu_item_id")
    .eq("cart_id", activeCartId);

  if (existingItemsError) throw existingItemsError;

  const itemIds = new Set(items.map((item) => item.menuItemId));
  const removedItemIds = (existingItems || [])
    .filter((item) => !itemIds.has(item.menu_item_id))
    .map((item) => item.id);

  if (removedItemIds.length) {
    const { error } = await supabase.from("menu_cart_items").delete().in("id", removedItemIds);
    if (error) throw error;
  }

  if (items.length) {
    const { error } = await supabase.from("menu_cart_items").upsert(
      items.map((item) => ({
        cart_id: activeCartId,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "cart_id,menu_item_id" },
    );
    if (error) throw error;
  }

  const { error: updateError } = await supabase
    .from("menu_carts")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", activeCartId);

  if (updateError) throw updateError;
  return activeCartId;
};

export const convertActiveMenuCart = async (cartId: string | null, orderId: string) => {
  if (!cartId) return;

  const { error } = await supabase
    .from("menu_carts")
    .update({ status: "converted", order_id: orderId, updated_at: new Date().toISOString() })
    .eq("id", cartId)
    .eq("status", "active");

  if (error) throw error;
};
