// Content models for the Glamnetic homepage clone

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
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}
