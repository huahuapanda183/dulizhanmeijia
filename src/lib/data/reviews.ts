// MOCK reviews. Behind api.getReviews() — swap for a reviews-service fetch later.
import type { Review } from "./types";

export const REVIEWS: Review[] = [
  { id: "r1", author: "Natalie", rating: 5, title: "Yas!", body: "These lasted over two weeks and looked amazing. Getting more!", productHandle: "citrus-coast", productTitle: "Galactic", productImage: "CitrusCoast_1.webp", verified: false, createdAt: "2026-07-13T05:00:00Z" },
  { id: "r2", author: "Natalie", rating: 5, title: "Love these!", body: "So chic and easy to wear. I get compliments every time.", productHandle: "la-perle", productTitle: "Oslo", productImage: "LaPerle_1.webp", verified: false, createdAt: "2026-07-13T05:00:00Z" },
  { id: "r3", author: "Sunny", rating: 5, title: "Fabulous", body: "The color is gorgeous and they went on in minutes.", productHandle: "aperitivo-hour", productTitle: "Espresso Glow", productImage: "AperitivoHour_1.webp", verified: true, createdAt: "2026-07-13T04:00:00Z" },
  { id: "r4", author: "Jessica", rating: 5, title: "So easy to apply", body: "Took me five minutes and they look like a salon set.", productHandle: "seaspell", productTitle: "Seaspell", productImage: "Seaspell_1.webp", verified: true, createdAt: "2026-07-12T12:00:00Z" },
  { id: "r5", author: "Maria", rating: 5, title: "Obsessed", body: "My new go-to. Held up through dishes, work, everything.", productHandle: "salty-waves", productTitle: "Salty Waves", productImage: "SaltyWaves_1.webp", verified: true, createdAt: "2026-07-12T09:00:00Z" },
  { id: "r6", author: "Dana", rating: 5, title: "Perfect summer set", body: "The prettiest shade for summer. Fit my nails perfectly.", productHandle: "moonstone", productTitle: "Moonstone", productImage: "Moonstone-1.webp", verified: false, createdAt: "2026-07-11T12:00:00Z" },
  { id: "r7", author: "Priya", rating: 5, title: "Salon quality at home", body: "Cannot believe these are press-ons. Flawless finish.", productHandle: "la-perle", productTitle: "La Perle", productImage: "LaPerle_2.webp", verified: true, createdAt: "2026-07-11T08:00:00Z" },
  { id: "r8", author: "Chloe", rating: 4, title: "Really pretty", body: "Beautiful design, took one extra try to size correctly.", productHandle: "citrus-coast", productTitle: "Citrus Coast", productImage: "CitrusCoast_2.webp", verified: true, createdAt: "2026-07-10T12:00:00Z" },
];
