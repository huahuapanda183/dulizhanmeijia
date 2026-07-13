// Product catalog for the /products/[handle] detail pages.
// La Perle has the full gallery + hover video (the showcase); the rest reuse
// their homepage imagery so every product link resolves to a real page.

export interface ProductDetail {
  handle: string;
  name: string;
  shape: string;
  price: string;
  comparePrice?: string;
  rating: number; // 0–5
  reviewCount: number;
  /** gallery images (files in /public/images) */
  images: string[];
  /** looping muted video played on hover over the main image (file in /public/videos) */
  video?: string;
  badge?: string;
  description: string;
}

const DESC =
  "Reusable press-on nails that go on in minutes and last up to two weeks. Each set includes 30 nails, nail glue, a nail file, cuticle stick, alcohol pad and 30 faux ongles — everything you need for a salon-quality mani at home.";

export const PRODUCTS: ProductDetail[] = [
  {
    handle: "la-perle",
    name: "La Perle",
    shape: "Short Squoval",
    price: "$17.99",
    rating: 4.7,
    reviewCount: 192,
    images: [
      "LaPerle_1.webp",
      "LaPerle_2.webp",
      "LaPerle_3.webp",
      "LaPerle_4.webp",
      "LaPerle_5.webp",
      "LaPerle_6.webp",
      "LaPerle_7.webp",
    ],
    video: "la-perle-1.mp4",
    description:
      "Glazed white French tips on a sheer nude base. La Perle is an everyday classic — short squoval nails that go on in minutes and last up to two weeks. " +
      DESC,
  },
  { handle: "citrus-coast", name: "Citrus Coast", shape: "Short Oval", price: "$21.99", rating: 5.0, reviewCount: 84, images: ["CitrusCoast_1.webp", "CitrusCoast_2.webp"], video: "la-perle-2.mp4", description: DESC },
  { handle: "salty-waves", name: "Salty Waves", shape: "Short Almond", price: "$21.99", rating: 4.8, reviewCount: 120, images: ["SaltyWaves_1.webp", "SaltyWaves_2.webp"], video: "la-perle-3.mp4", description: DESC },
  { handle: "pinch-me", name: "Pinch Me", shape: "Short Oval", price: "$19.99", rating: 4.8, reviewCount: 96, images: ["PinchMe_6.webp", "PinchMe_1.webp"], video: "la-perle-4.mp4", description: DESC },
  { handle: "seaspell", name: "Seaspell", shape: "Short Almond", price: "$17.99", rating: 4.7, reviewCount: 61, images: ["Seaspell_1.webp", "Seaspell_2.webp"], description: DESC },
  { handle: "summer-fresco", name: "Summer Fresco", shape: "Medium Almond", price: "$19.99", rating: 4.7, reviewCount: 45, images: ["EuroSummerPDP_SummerFresco_1.webp", "EuroSummerPDP_SummerFresco_2.webp"], description: DESC },
  { handle: "aperitivo-hour", name: "Aperitivo Hour", shape: "Short Oval", price: "$21.99", rating: 4.8, reviewCount: 73, images: ["AperitivoHour_1.webp", "AperitivoHour_2.webp"], description: DESC },
  { handle: "berry-fizz", name: "Berry Fizz", shape: "Short Squoval", price: "$17.99", rating: 4.9, reviewCount: 58, images: ["2026_03_IndividualPDPUpdates_Batch3_BerryFizzUGC.webp"], description: DESC },
  { handle: "sparkling-gems-collection", name: "Sparkling Gems Collection", shape: "Full Collection Bundle", price: "$264.47", comparePrice: "$377.82", badge: "NEW", rating: 4.9, reviewCount: 34, images: ["SparklingGemsCollection_NailMenu.webp", "Sparkling_Gems_Collection_UGC.webp"], description: "The complete Sparkling Gems bundle — every jewel-toned set in one collection. " + DESC },
  { handle: "moonstone", name: "Moonstone", shape: "Short Almond", price: "$21.99", badge: "NEW", rating: 4.8, reviewCount: 40, images: ["Moonstone-1.webp"], description: DESC },
  { handle: "mystic-topaz", name: "Mystic Topaz", shape: "Medium Oval", price: "$19.99", badge: "NEW", rating: 4.8, reviewCount: 38, images: ["MysticTopaz_1.webp"], description: DESC },
  { handle: "aquamarine", name: "Aquamarine", shape: "Short Oval", price: "$21.99", badge: "NEW", rating: 4.7, reviewCount: 29, images: ["Aquamarine-1.webp"], description: DESC },
  { handle: "mystic-energy", name: "Mystic Energy", shape: "Bundle", price: "$55.77", comparePrice: "$61.97", rating: 4.8, reviewCount: 22, images: ["MysticEnergy_NailMenu.webp", "MysticEnergy_UGC.webp"], description: DESC },
  { handle: "sapphire", name: "Sapphire", shape: "Short Almond", price: "$21.99", rating: 4.8, reviewCount: 51, images: ["Sapphire_1_1.webp"], description: DESC },
  { handle: "obsidian", name: "Obsidian", shape: "Bundle", price: "$184.72", comparePrice: "$263.88", rating: 4.9, reviewCount: 27, images: ["Obsidian_1.webp"], description: DESC },
  { handle: "3d-jewel-stack", name: "3D Jewel Stack", shape: "Short Coffin", price: "$21.99", rating: 4.7, reviewCount: 33, images: ["3DJewelStack_NailMenu.webp", "3DJewelStack_UGC.webp"], description: DESC },
];

export const PRODUCT_MAP: Record<string, ProductDetail> = Object.fromEntries(
  PRODUCTS.map((p) => [p.handle, p]),
);

export function getProduct(handle: string): ProductDetail | undefined {
  return PRODUCT_MAP[handle];
}

export const PRODUCT_FEATURES = [
  { icon: "clock", label: "10 Minute\nApplication" },
  { icon: "calendar", label: "Up to 2 Weeks\nWear" },
  { icon: "salon", label: "Salon Quality" },
  { icon: "bunny", label: "Certified by\nLeaping Bunny" },
] as const;

export const MEMBERSHIP_PERKS = [
  "Earn 15% back in store credit on all orders",
  "FREE U.S. shipping on all orders",
  "$10 Welcome credit",
  "FREE nail at sign-up ($15.99 value)",
  "Exclusive early access to new launches",
];
