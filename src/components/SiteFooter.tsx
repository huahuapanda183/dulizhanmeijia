import Link from "next/link";
import { LynxiGlamLogo } from "@/components/icons";
import { NewsletterForm } from "@/components/NewsletterForm";
import { FOOTER_COLUMNS } from "@/lib/data/content";
import { T } from "@/lib/i18n/i18n-context";

const legalLinks = [
  { label: "Returns & Refunds", href: "/pages/returns" },
  { label: "Privacy Policy", href: "/pages/privacy" },
  { label: "Terms of Service", href: "/pages/terms" },
];

export function SiteFooter() {
  return (
    <footer className="w-full bg-cream text-ink">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-10 px-6 py-14 md:grid-cols-4 md:px-10">
        {/* Column 1 — LynxiGlam VIP */}
        <div>
          <h3 className="mb-3 text-[20px] text-ink"><T k="LynxiGlam VIP" /></h3>
          <p className="mb-6 text-[14px] text-body">
            <T k="Sign up for emails and texts to be the first to know about exclusive deals, launches & more!" />
          </p>
          <NewsletterForm />
        </div>

        {/* Columns 2–4 — link groups from content */}
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 text-[18px] text-ink"><T k={col.title} /></h3>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="block py-1.5 text-[14px] text-body hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {col.title === "Social" && (
              <>
                <h4 className="mb-3 mt-8 text-[15px] text-ink">Download Our App</h4>
                <div className="flex gap-3">
                  <a href="#" className="flex items-center gap-2 rounded-md bg-black px-3 py-2 text-white">
                    <span className="flex flex-col leading-none">
                      <span className="text-[8px]">Download on the</span>
                      <span className="text-[13px] font-semibold">App Store</span>
                    </span>
                  </a>
                  <a href="#" className="flex items-center gap-2 rounded-md bg-black px-3 py-2 text-white">
                    <span className="flex flex-col leading-none">
                      <span className="text-[8px]">GET IT ON</span>
                      <span className="text-[13px] font-semibold">Google Play</span>
                    </span>
                  </a>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Bottom legal bar */}
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10">
          <LynxiGlamLogo className="text-[22px] text-ink" />
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-[13px] text-body hover:text-ink">
                {link.label}
              </Link>
            ))}
          </div>
          <span className="text-[12px] text-body">© 2026 LynxiGlam</span>
        </div>
      </div>
    </footer>
  );
}
