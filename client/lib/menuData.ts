export type MenuCategory = "appetizers" | "mains" | "desserts" | "beverages" | "special";
export type MenuDifficulty = "low" | "medium" | "high";

export interface MenuItem {
  id: string;
  databaseId?: string;
  name: string;
  description: string;
  currency?: string;
  mediaType?: "image" | "video";
  mediaUrl?: string;
  mediaAttachmentId?: string;
  price: number;
  originalPrice: number;
  category: MenuCategory;
  image: string;
  cookTime: string;
  difficulty: MenuDifficulty;
  availability: number;
  maxAvailability: number;
  dietary: string[];
  spiceLevel: number;
  popularity: number;
  origin: string;
  calories: number;
  description_full: string;
  chef_note: string;
  trending: boolean;
  special_offer: string | null;
  statuses?: string[];
  approved: boolean;
}

export const defaultMenuItems: MenuItem[] = [
  {
    id: "truffle-pasta",
    name: "Truffle Mushroom Pasta",
    description: "Handmade fettuccine with wild mushrooms, black truffle shavings, and aged parmesan",
    price: 34,
    originalPrice: 42,
    category: "mains",
    image: "🍝",
    cookTime: "15-20 min",
    difficulty: "medium",
    availability: 8,
    maxAvailability: 12,
    dietary: ["vegetarian"],
    spiceLevel: 1,
    popularity: 95,
    origin: "Northern Italy",
    calories: 580,
    description_full: "Our signature pasta features locally foraged wild mushrooms, premium black truffle from Périgord, and 24-month aged Parmigiano-Reggiano. The pasta is made fresh daily in our kitchen using traditional Italian techniques.",
    chef_note: "Chef Marco's personal favorite - a taste of authentic Italian countryside",
    trending: true,
    special_offer: "Limited time: 20% off",
    approved: true,
  },
  {
    id: "wagyu-steak",
    name: "Wagyu Beef Tenderloin",
    description: "A5 Wagyu beef with roasted vegetables and red wine reduction",
    price: 89,
    originalPrice: 105,
    category: "mains",
    image: "🥩",
    cookTime: "25-30 min",
    difficulty: "high",
    availability: 4,
    maxAvailability: 6,
    dietary: ["gluten-free"],
    spiceLevel: 2,
    popularity: 88,
    origin: "Japan",
    calories: 650,
    description_full: "Premium A5 Wagyu beef sourced directly from certified farms in Japan. Grilled to perfection and served with seasonal roasted vegetables and our signature red wine reduction made with French Bordeaux.",
    chef_note: "Our most exclusive cut - limited daily availability",
    trending: false,
    special_offer: null,
    approved: true,
  },
  {
    id: "lobster-bisque",
    name: "Maine Lobster Bisque",
    description: "Creamy lobster soup with fresh herbs and cognac finish",
    price: 18,
    originalPrice: 18,
    category: "appetizers",
    image: "🦞",
    cookTime: "5-8 min",
    difficulty: "low",
    availability: 15,
    maxAvailability: 20,
    dietary: ["gluten-free"],
    spiceLevel: 1,
    popularity: 92,
    origin: "New England, USA",
    calories: 320,
    description_full: "Rich and velvety soup made from fresh Maine lobster shells, cream, and aromatic vegetables. Finished with a splash of fine cognac and garnished with fresh chives.",
    chef_note: "A classic preparation that highlights the sweet lobster flavor",
    trending: false,
    special_offer: null,
    approved: true,
  },
  {
    id: "chocolate-souffle",
    name: "Dark Chocolate Soufflé",
    description: "Warm chocolate soufflé with vanilla ice cream and berry coulis",
    price: 16,
    originalPrice: 20,
    category: "desserts",
    image: "🍫",
    cookTime: "20-25 min",
    difficulty: "high",
    availability: 0,
    maxAvailability: 8,
    dietary: ["vegetarian"],
    spiceLevel: 0,
    popularity: 85,
    origin: "France",
    calories: 420,
    description_full: "Individual chocolate soufflé made with premium 70% Belgian dark chocolate. Served warm with house-made vanilla bean ice cream and mixed berry coulis.",
    chef_note: "Please allow 25 minutes preparation time - worth the wait!",
    trending: false,
    special_offer: "Today only: 20% off",
    approved: true,
  },
  {
    id: "craft-cocktail",
    name: "Sheraton Signature Martini",
    description: "Premium gin with our house-made vermouth and garnishes",
    price: 16,
    originalPrice: 16,
    category: "beverages",
    image: "🍸",
    cookTime: "3-5 min",
    difficulty: "medium",
    availability: 25,
    maxAvailability: 30,
    dietary: ["vegan", "gluten-free"],
    spiceLevel: 0,
    popularity: 78,
    origin: "House Creation",
    calories: 180,
    description_full: "Our bartender's signature creation featuring premium botanical gin, house-made dry vermouth infused with local herbs, and finished with our special garnish selection.",
    chef_note: "Each martini is crafted to order with precision and care",
    trending: true,
    special_offer: "Happy Hour: Buy 2 get 1 free",
    approved: true,
  },
];

export const menuItemFromDatabaseRow = (row: any): MenuItem => ({
  id: row.id,
  databaseId: row.id,
  name: row.name,
  description: row.short_description || "",
  description_full: row.full_description || row.short_description || "",
  currency: String(row.currency || "USD").toUpperCase(),
  mediaType: row.media_type || undefined,
  mediaUrl: row.media_url || undefined,
  mediaAttachmentId: row.media_attachment_id || undefined,
  price: Number(row.price),
  originalPrice: Number(row.original_price || row.price),
  category: row.category,
  image: row.icon || "🍽️",
  cookTime: row.preparation_time || "",
  difficulty: row.difficulty || "medium",
  availability: Number(row.availability || 0),
  maxAvailability: Number(row.max_availability || 0),
  dietary: row.dietary_tags || [],
  spiceLevel: Number(row.spice_level || 0),
  popularity: Number(row.popularity || 0),
  origin: row.origin || "",
  calories: Number(row.calories || 0),
  chef_note: row.chef_note || "",
  trending: Boolean(row.is_trending),
  special_offer: row.special_offer || null,
  statuses: row.status_labels || [],
  approved: row.is_published !== false,
});
