import type { Metadata } from "next";
import { Sofia_Sans } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { CartProvider } from "@/lib/cart/cart-context";
import { WishlistProvider } from "@/lib/wishlist/wishlist-context";
import { UIProvider } from "@/lib/ui/ui-context";
import { CartDrawer } from "@/components/CartDrawer";
import { SearchOverlay } from "@/components/SearchOverlay";

const sofia = Sofia_Sans({
  variable: "--font-sofia",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Magnetic Eyelashes & Press-on Nails I LynxiGlam",
  description:
    "LynxiGlam offers premium magnetic eyelashes and press-on nails that are reusable, easy to apply, and long lasting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sofia.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <I18nProvider>
          <CartProvider>
            <WishlistProvider>
              <UIProvider>
                {children}
                <CartDrawer />
                <SearchOverlay />
              </UIProvider>
            </WishlistProvider>
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
