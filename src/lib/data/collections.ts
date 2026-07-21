// MOCK collections + navigation. Product lists are derived from the catalog by
// the API layer (a product belongs to a collection via its `collections` field).
import type { Collection, NavItem } from "./types";

export const COLLECTIONS: Omit<Collection, "products">[] = [
  { handle: "all", title: "Shop All", description: "Every press-on nail set, lash, bundle and accessory.", image: "Shop_Nails.png" },
  { handle: "shop-all-lynxiglam-products", title: "Shop All LynxiGlam Products", description: "The full LynxiGlam lineup — nails, lashes, liners and accessories.", image: "Shop_Nails.png" },
  { handle: "all-nails", title: "Glue-On Nails", description: "Reusable press-on nails in every shape and style.", image: "Shop_Nails.png" },
  { handle: "press-on-nails", title: "Press-On Nails", description: "Salon-quality press-on nails.", image: "Shop_Nails.png" },
  { handle: "best-sellers", title: "Best Sellers", description: "Our most-loved sets.", image: "CitrusCoast_1.webp" },
  { handle: "new", title: "New Nail Arrivals", description: "Just dropped.", image: "Moonstone-1.webp" },
  { handle: "bundles", title: "Nail Bundles & Sets", description: "Buy more, save more.", image: "SparklingGemsCollection_NailMenu.webp" },
  { handle: "accessories-bundles", title: "Nail Accessories Bundles", description: "Everything you need to apply and remove, bundled.", image: "2023_03_Brush-On-Nail-Glue_HighRes_1.jpg" },
  { handle: "sparkling-gems", title: "Sparkling Gems", description: "Jewel-toned press-on nails.", image: "2026_07_SparklingGems_HP_DesktopGeneral.webp" },
  { handle: "sandal-season", title: "Sandal Season", description: "Summer-ready shades for fingers and toes.", image: "2026_06_SandalSeason_HP_Desktop.webp" },
  { handle: "glam-icons", title: "Glam Icons", description: "New shapes. More styles to love.", image: "2026_06_GlamIcons_HP_Desktop_1.webp" },
  { handle: "euro-summer", title: "Euro Summer", description: "Sun-soaked summer shades.", image: "2026_04_EuroSummer_HPWidget_US.webp" },
  { handle: "french", title: "French Tips", description: "Timeless French manicures.", image: "LaPerle_1.webp" },
  // Collabs
  { handle: "nail-collabs", title: "Nail Collabs", description: "Limited-edition collaborations.", image: "2026_06_Glamzilla_HP_Desktop.webp" },
  { handle: "glamzilla", title: "LynxiGlam x Glamzilla", description: "GLAMSQUAD FOREVER — by the squad, for the squad.", image: "2026_06_Glamzilla_HP_Desktop.webp" },
  { handle: "harry-potter", title: "Harry Potter™ x LynxiGlam", description: "Cast a spell with the Wizarding World collection.", image: "Obsidian_1.webp" },
  { handle: "hello-kitty", title: "Hello Kitty® and Friends", description: "Supercute press-on nails with Hello Kitty and Friends.", image: "Moonstone-1.webp" },
  { handle: "fanatics", title: "LynxiGlam x Fanatics", description: "Rep your team in style.", image: "MysticTopaz_1.webp" },
  // Quick press + accessories
  { handle: "quick-press-mani", title: "Quick Press Mani", description: "Our fastest mani yet.", image: "LynxiGlam_QuickPressMani_Homepage_CategoryModule.webp" },
  { handle: "accessories", title: "Nail Accessories", description: "Glue, removers and tools.", image: "SHOP_ACCESSORIE.png" },
  // Lashes & liners
  { handle: "all-lashes", title: "Lashes & Liner", description: "Reusable magnetic lashes and liners.", image: "Magnetic_Lashes.jpg" },
  { handle: "magnetic-lashes", title: "Magnetic Lashes", description: "Reusable magnetic lashes — no glue needed.", image: "Lashes_1.webp" },
  { handle: "magnetic-liners", title: "Magnetic Liners", description: "The liner that holds your lashes all day.", image: "2023_10_RebrandedLinerPDP_MagneticLiquidLiner_1.jpg" },
  { handle: "best-selling-lashes", title: "Best Selling Lashes", description: "Our most-loved lashes and liners.", image: "Lashes_3.webp" },
];

export const NAVIGATION: NavItem[] = [
  {
    label: "SHOP ALL",
    href: "/collections/all",
    columns: [
      {
        heading: "Glue-On Nails",
        links: [
          { label: "NEW: Sparkling Gems", href: "/collections/sparkling-gems" },
          { label: "NEW: Sandal Season", href: "/collections/sandal-season" },
          { label: "NEW: Glam Icons", href: "/collections/glam-icons" },
          { label: "Euro Summer", href: "/collections/euro-summer" },
          { label: "Best-Selling Nails", href: "/collections/best-sellers" },
          { label: "New Nail Arrivals", href: "/collections/new" },
          { label: "Nail Accessories", href: "/collections/accessories" },
          { label: "SHOP ALL", href: "/collections/all-nails" },
        ],
      },
      {
        heading: "Nail Collabs",
        links: [
          { label: "LYNXIGLAM X GLAMZILLA", href: "/collections/glamzilla" },
          { label: "Harry Potter™ x LynxiGlam", href: "/collections/harry-potter" },
          { label: "Hello Kitty® and Friends", href: "/collections/hello-kitty" },
          { label: "LynxiGlam x Fanatics", href: "/collections/fanatics" },
        ],
      },
      {
        heading: "Nail Bundles",
        links: [
          { label: "Build Your Own Sparkling Gems Nail Bundle", href: "/pages/build-your-own-bundle" },
          { label: "Nail Bundles & Sets", href: "/collections/bundles" },
          { label: "Nail Accessories Bundles", href: "/collections/accessories-bundles" },
          { label: "Build Your Own Nail Bundle", href: "/pages/build-your-own-bundle" },
          { label: "Shop All Bundles", href: "/collections/bundles" },
        ],
      },
      {
        heading: "Lashes & Liner",
        links: [
          { label: "Best Selling Lashes", href: "/collections/best-selling-lashes" },
          { label: "Magnetic Lashes", href: "/collections/magnetic-lashes" },
          { label: "Magnetic Liners", href: "/collections/magnetic-liners" },
          { label: "SHOP ALL", href: "/collections/all-lashes" },
        ],
      },
    ],
    featured: [
      { label: "Best-Selling Nails", image: "CitrusCoast_1.webp", href: "/collections/best-sellers" },
      { label: "Press-On Nail Collabs", image: "2.0HP-Widget_GlamFam.webp", href: "/collections/nail-collabs" },
      { label: "Press-On Nails", image: "LaPerle_1.webp", href: "/collections/all-nails" },
      { label: "Magnetic Lashes", image: "Magnetic_Lashes.jpg", href: "/collections/magnetic-lashes" },
    ],
  },
  {
    label: "GLUE-ON NAILS",
    href: "/collections/all-nails",
    columns: [
      {
        heading: "Shop By",
        links: [
          { label: "Best-Selling Nails", href: "/collections/best-sellers" },
          { label: "New Nail Arrivals", href: "/collections/new" },
          { label: "Nail Bundles & Sets", href: "/collections/bundles" },
          { label: "Nail Accessories", href: "/collections/accessories" },
          { label: "Shop All Nails", href: "/collections/all-nails" },
        ],
      },
      {
        heading: "Collections",
        links: [
          { label: "NEW: Sparkling Gems", href: "/collections/sparkling-gems" },
          { label: "NEW: Sandal Season", href: "/collections/sandal-season" },
          { label: "NEW: Glam Icons", href: "/collections/glam-icons" },
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
      { label: "Our Fastest Mani Yet", image: "LynxiGlam_QuickPressMani_Homepage_CategoryModule.webp", href: "/collections/quick-press-mani" },
    ],
  },
  {
    label: "LASHES",
    href: "/collections/all-lashes",
    columns: [
      {
        heading: "Shop By",
        links: [
          { label: "Best Selling Lashes", href: "/collections/best-selling-lashes" },
          { label: "Magnetic Lashes", href: "/collections/magnetic-lashes" },
          { label: "Magnetic Liners", href: "/collections/magnetic-liners" },
          { label: "Shop All Lashes", href: "/collections/all-lashes" },
        ],
      },
    ],
    featured: [
      { label: "Magnetic Lashes", image: "Lashes_1.webp", href: "/collections/magnetic-lashes" },
    ],
  },
  {
    label: "BUNDLES",
    href: "/collections/bundles",
    columns: [
      {
        heading: "Bundles",
        links: [
          { label: "Build Your Own Nail Bundle", href: "/pages/build-your-own-bundle" },
          { label: "Nail Bundles & Sets", href: "/collections/bundles" },
          { label: "Nail Accessories Bundles", href: "/collections/accessories-bundles" },
          { label: "Shop All Bundles", href: "/collections/bundles" },
        ],
      },
    ],
    featured: [
      { label: "Sparkling Gems Bundle", image: "SparklingGemsCollection_NailMenu.webp", href: "/collections/bundles" },
    ],
  },
  { label: "LOYALTY", href: "/pages/loyalty" },
];
