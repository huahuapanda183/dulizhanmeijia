import { CarouselRail } from "@/components/CarouselRail";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types";

const PRODUCTS: Product[] = [
  { name: "Sparkling Gems Collection", shape: "Full Collection Bundle", price: "$264.47", comparePrice: "$377.82", badge: "NEW", image: "SparklingGemsCollection_NailMenu.webp", hoverImage: "Sparkling_Gems_Collection_UGC.webp", href: "/products/sparkling-gems-collection" },
  { name: "Moonstone", shape: "Short Almond", price: "$21.99", badge: "NEW", image: "Moonstone-1.webp", href: "/products/moonstone" },
  { name: "Mystic Topaz", shape: "Medium Oval", price: "$19.99", badge: "NEW", image: "MysticTopaz_1.webp", href: "/products/mystic-topaz" },
  { name: "Aquamarine", shape: "Short Oval", price: "$21.99", badge: "NEW", image: "Aquamarine-1.webp", href: "/products/aquamarine" },
  { name: "Mystic Energy", shape: "Bundle", price: "$55.77", comparePrice: "$61.97", image: "MysticEnergy_NailMenu.webp", hoverImage: "MysticEnergy_UGC.webp", href: "/products/mystic-energy" },
  { name: "Sapphire", shape: "Short Almond", price: "$21.99", image: "Sapphire_1_1.webp", href: "/products/sapphire" },
  { name: "Obsidian", shape: "Bundle", price: "$184.72", comparePrice: "$263.88", image: "Obsidian_1.webp", href: "/products/obsidian" },
  { name: "3D Jewel Stack", shape: "Short Coffin", price: "$21.99", image: "3DJewelStack_NailMenu.webp", hoverImage: "3DJewelStack_UGC.webp", href: "/products/3d-jewel-stack" },
];

export function ShopAllPressOns() {
  return (
    <section className="w-full bg-cream py-12 md:py-16">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8">
        <h2 className="heading-track mb-8 text-center text-[30px] font-medium text-ink md:mb-10 md:text-[38px]">
          Shop All Press-On Nails
        </h2>
        <CarouselRail ariaLabel="Shop all press-on nails">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.name} product={p} />
          ))}
        </CarouselRail>
      </div>
    </section>
  );
}
