// Content models for the LynxiGlam homepage clone

export interface NavItem {
  label: string;
  href: string;
}

export interface HeroSlide {
  /** Desktop banner image in /public/images */
  desktop: string;
  /** Mobile banner image in /public/images */
  mobile: string;
  alt: string;
  href: string;
}

export interface CollectionCard {
  label: string;
  image: string;
  href: string;
  /** Text/overlay color treatment */
  dark?: boolean;
}

export interface Product {
  name: string;
  /** e.g. "Short Oval", "Full Collection Bundle" */
  shape: string;
  price: string;
  /** compare-at (strikethrough) price, if on sale */
  comparePrice?: string;
  rating?: string;
  image: string;
  /** second image shown on hover */
  hoverImage?: string;
  href: string;
  badge?: "NEW" | "BESTSELLER" | string;
  /** corner sale ribbon text, e.g. "30% OFF" */
  ribbon?: string;
}

export interface Review {
  rating: number;
  name: string;
  verified?: boolean;
  timeAgo: string;
  productName: string;
  productImage: string;
  title: string;
  body?: string;
}

export interface FeatureCard {
  label: string;
  image: string;
  href: string;
}

export interface Logo {
  name: string;
  image: string;
}

export interface FooterLink {
  label: string;
  /**
   * Omit for a destination LynxiGlam does not own yet. The footer then renders
   * the label as plain text instead of a link. Deliberately optional rather
   * than `href: "#"`: a `#` still looks and behaves like a link, and these
   * entries previously pointed at Glamnetic's real social accounts, sending
   * our visitors to another brand.
   */
  href?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}
