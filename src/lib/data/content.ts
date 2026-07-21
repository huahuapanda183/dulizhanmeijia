// MOCK site content (marketing modules that aren't products). Behind
// api.getSiteContent() so a CMS/backend can supply these later.
import type { FooterColumn } from "@/types";

export interface HeroSlide {
  desktop: string;
  mobile: string;
  alt: string;
  href: string;
}
export interface OverlayCard {
  label: string;
  image: string;
  href: string;
}
export interface Logo {
  name: string;
  image: string;
}

export const ANNOUNCEMENTS = [
  "FREE SHIPPING IN THE US + CANADA ON ORDERS $65+ USD",
  "SCORE FREE U.S. ECONOMY SHIPPING — USE CODE: FREESHIP",
  "BUY MORE, SAVE MORE — BUILD YOUR OWN BUNDLE",
];

export const HERO_SLIDES: HeroSlide[] = [
  { desktop: "2026_07_FreeUSShipping_HP_Desktop_copy.webp", mobile: "2026_07_FreeUSShipping_HP_Mobile_copy.webp", alt: "Score free U.S. economy shipping", href: "/collections/all" },
  { desktop: "2026_06_GlamIcons_HP_Desktop_1.webp", mobile: "2026_06_GlamIcons_HP_Mobile_3.webp", alt: "Glam Icons collection", href: "/collections/new" },
  { desktop: "2026_06_Glamzilla_HP_Desktop.webp", mobile: "2026_06_Glamzilla_HP_Mobile.webp", alt: "LynxiGlam x Glamzilla", href: "/collections/all-nails" },
  { desktop: "2026_06_SandalSeason_HP_Desktop.webp", mobile: "2026_06_SandalSeason_HP_Mobile.webp", alt: "Sandal season collection", href: "/collections/all-nails" },
  { desktop: "2026_07_SparklingGems_HP_DesktopGeneral.webp", mobile: "2026_07_SparklingGems_HP_MobileGeneral.webp", alt: "Sparkling gems collection", href: "/collections/sparkling-gems" },
];

export const CATEGORY_CARDS: OverlayCard[] = [
  { label: "Shop Glue On Nails", image: "Shop_Nails.png", href: "/collections/all-nails" },
  { label: "Shop Quick Press Mani", image: "LynxiGlam_QuickPressMani_Homepage_CategoryModule.webp", href: "/collections/quick-press-mani" },
  { label: "Shop Accessories", image: "SHOP_ACCESSORIE.png", href: "/collections/accessories" },
  { label: "Shop Lashes", image: "Shop_Lashes.png", href: "/collections/all-lashes" },
];

export const PROMO_CARDS: OverlayCard[] = [
  { label: "Free Shipping", image: "2026_05_FreeUSShipping_HPWidget.webp", href: "/pages/shipping" },
  { label: "New: Sparkling Gems", image: "2026_07_SparklingGems_HPWidgetGeneral.webp", href: "/collections/sparkling-gems" },
  { label: "NEW: Sandal Season Collection", image: "2026_06_SandalSeason_HPWidget.webp", href: "/collections/all-nails" },
  { label: "NEW STYLES ADDED: Glam Icons", image: "2026_06_GlamIcons_HPWidget.webp", href: "/collections/new" },
  { label: "LYNXIGLAM X GLAMZILLA", image: "2026_05_Glamzilla_HPWidget_US.webp", href: "/collections/all-nails" },
];

export const FEATURE_CARDS: OverlayCard[] = [
  { label: "Join Our Membership Program", image: "2.0HP-Widget_VIPInsiders.webp", href: "/pages/membership" },
  { label: "Join the GlamFam Community", image: "2.0HP-Widget_GlamFam.webp", href: "/pages/glamfam" },
];

export const RETAILER_LOGOS: Logo[] = [
  { name: "Ulta Beauty", image: "ULTA_Beauty_Logo_2.png" },
  { name: "Sephora", image: "Sephora-Logo.png" },
  { name: "Ulta Beauty at Target", image: "ulta_target.png" },
  { name: "Kohl's Sephora", image: "kohls_sephora.png" },
];

export const PRESS_LOGOS: Logo[] = [
  { name: "Cosmopolitan", image: "cosmopolitan.webp" },
  { name: "Elle", image: "elle.webp" },
  { name: "InStyle", image: "instyle.webp" },
  { name: "People", image: "people.webp" },
  { name: "Byrdie", image: "byrdie.webp" },
  { name: "Oprah Daily", image: "oprahdaily.webp" },
  { name: "Parade", image: "parade.webp" },
  { name: "Glamour", image: "glamour.webp" },
  { name: "Allure", image: "allure.webp" },
  { name: "Bustle", image: "bustle.webp" },
  { name: "Teen Vogue", image: "teenvogue.webp" },
  { name: "Who What Wear", image: "whowhatwear.webp" },
];

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

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Brand",
    links: [
      { label: "Login", href: "/account/login" },
      { label: "About", href: "/pages/about" },
      { label: "Blog", href: "/blogs/news" },
      { label: "VIP GlamFam Group", href: "/pages/glamfam" },
      { label: "Reviews", href: "/pages/reviews" },
      { label: "Membership", href: "/pages/membership" },
      { label: "Wholesale", href: "/pages/wholesale" },
    ],
  },
  {
    title: "Social",
    links: [
      // No href: LynxiGlam has no social accounts yet. These used to point at
      // Glamnetic's real profiles, so clicking "TikTok" in our footer handed the
      // visitor to another brand. Add the URL here once an account exists.
      { label: "Instagram" },
      { label: "TikTok" },
      { label: "Facebook" },
      { label: "X" },
      { label: "Youtube" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Help Center", href: "/pages/help" },
      { label: "Shipping", href: "/pages/shipping" },
      { label: "Track My Order", href: "/pages/track" },
      { label: "Returns", href: "/pages/returns" },
      { label: "How To Apply Press-Ons", href: "/pages/apply" },
      { label: "How To Remove Press-Ons", href: "/pages/remove" },
      { label: "Quick Press Mani Application Tips", href: "/pages/quick-press-tips" },
      { label: "Store Locator", href: "/pages/store-locator" },
    ],
  },
];
