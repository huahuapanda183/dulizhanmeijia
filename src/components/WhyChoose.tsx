import Link from "next/link";

/**
 * "Why Choose LynxiGlam?" banner — a single full-width burgundy image with the
 * heading, copy and award badges (Allure / Cosmopolitan / Leaping Bunny) baked in.
 */
export function WhyChoose() {
  return (
    <section aria-label="Why choose LynxiGlam" className="w-full bg-burgundy">
      <Link href="/pages/about" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/badges_desktop_38ca45e0-5783-490c-86ac-aed6617c66da.webp"
          alt="Why choose LynxiGlam — Allure Best of Beauty 2025, Cosmopolitan Readers' Choice 2025, Certified by Leaping Bunny"
          className="hidden h-auto w-full md:block"
          loading="lazy"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/badges_mobile_618c2faa-940d-41c3-8a31-1acb813e9e53.webp"
          alt="Why choose LynxiGlam"
          className="block h-auto w-full md:hidden"
          loading="lazy"
        />
      </Link>
    </section>
  );
}
