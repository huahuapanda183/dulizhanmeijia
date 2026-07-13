// MOCK collections + navigation. Product lists are derived from the catalog by
// the API layer (a product belongs to a collection via its `collections` field),
// so ordering/data stays in one place.
import type { Collection, NavItem } from "./types";

export const COLLECTIONS: Omit<Collection, "products">[] = [
  { handle: "all", title: "Shop All", description: "Every press-on nail set, bundle and accessory.", image: "Shop_Nails.png" },
  { handle: "all-nails", title: "Glue-On Nails", description: "Reusable press-on nails in every shape and style.", image: "Shop_Nails.png" },
  { handle: "press-on-nails", title: "Press-On Nails", description: "Salon-quality press-on nails.", image: "Shop_Nails.png" },
  { handle: "best-sellers", title: "Best Sellers", description: "Our most-loved sets.", image: "CitrusCoast_1.webp" },
  { handle: "new", title: "New Arrivals", description: "Just dropped.", image: "Moonstone-1.webp" },
  { handle: "bundles", title: "Bundles", description: "Buy more, save more.", image: "SparklingGemsCollection_NailMenu.webp" },
  { handle: "sparkling-gems", title: "Sparkling Gems", description: "Jewel-toned press-on nails.", image: "2026_07_SparklingGems_HP_DesktopGeneral.webp" },
  { handle: "euro-summer", title: "Euro Summer", description: "Sun-soaked summer shades.", image: "2026_04_EuroSummer_HPWidget_US.webp" },
  { handle: "french", title: "French Tips", description: "Timeless French manicures.", image: "LaPerle_1.webp" },
  { handle: "quick-press-mani", title: "Quick Press Mani", description: "Our fastest mani yet.", image: "Glamnetic_QuickPressMani_Homepage_CategoryModule.webp" },
  { handle: "accessories", title: "Accessories", description: "Glue, removers and tools.", image: "SHOP_ACCESSORIE.png" },
  { handle: "all-lashes", title: "Lashes", description: "Reusable magnetic lashes.", image: "Shop_Lashes.png" },
];

export const NAVIGATION: NavItem[] = [
  { label: "SHOP ALL", href: "/collections/all" },
  {
    label: "GLUE-ON NAILS",
    href: "/collections/all-nails",
    columns: [
      {
        heading: "Shop By",
        links: [
          { label: "Best-Selling Nails", href: "/collections/best-sellers" },
          { label: "New Nail Arrivals", href: "/collections/new" },
          { label: "Bundles", href: "/collections/bundles" },
          { label: "Nail Accessories", href: "/collections/accessories" },
          { label: "Shop All Nails", href: "/collections/all-nails" },
        ],
      },
      {
        heading: "Collections",
        links: [
          { label: "NEW: Sparkling Gems", href: "/collections/sparkling-gems" },
          { label: "Euro Summer", href: "/collections/euro-summer" },
          { label: "French Tips", href: "/collections/french" },
        ],
      },
    ],
    featured: [
      { label: "NEW: Sparkling Gems", image: "2026_07_SparklingGems_HPWidgetGeneral.webp", href: "/collections/sparkling-gems" },
    ],
  },
  {
    label: "QUICK PRESS MANI",
    href: "/collections/quick-press-mani",
    columns: [
      {
        heading: "Quick Press Mani",
        links: [
          { label: "Shop Quick Press Mani", href: "/collections/quick-press-mani" },
          { label: "Application Tips", href: "/pages/quick-press-tips" },
        ],
      },
    ],
    featured: [
      { label: "Our Fastest Mani Yet", image: "Glamnetic_QuickPressMani_Homepage_CategoryModule.webp", href: "/collections/quick-press-mani" },
    ],
  },
  { label: "LASHES", href: "/collections/all-lashes" },
  { label: "BUNDLES", href: "/collections/bundles" },
  { label: "LOYALTY", href: "/pages/loyalty" },
];
