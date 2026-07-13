import { GlamneticLogo, ChevronRightIcon } from "@/components/icons";

interface FooterLink {
  label: string;
  href: string;
}

const brandLinks: FooterLink[] = [
  { label: "Login", href: "/account/login" },
  { label: "About", href: "/pages/about" },
  { label: "Blog", href: "/blogs/news" },
  { label: "VIP GlamFam Group", href: "/pages/glamfam" },
  { label: "Reviews", href: "/pages/reviews" },
  { label: "Membership", href: "/pages/membership" },
  { label: "Wholesale", href: "/pages/wholesale" },
];

const socialLinks: FooterLink[] = [
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "X", href: "#" },
  { label: "Youtube", href: "#" },
];

const customerServiceLinks: FooterLink[] = [
  { label: "Help Center", href: "/pages/help" },
  { label: "Shipping", href: "/pages/shipping" },
  { label: "Track My Order", href: "/pages/track" },
  { label: "Returns", href: "/pages/returns" },
  { label: "How To Apply Press-Ons", href: "/pages/apply" },
  { label: "How To Remove Press-Ons", href: "/pages/remove" },
  { label: "Quick Press Mani Application Tips", href: "/pages/quick-press-tips" },
  { label: "Store Locator", href: "/pages/store-locator" },
];

const legalLinks: FooterLink[] = [
  { label: "Returns & Refunds", href: "/pages/returns" },
  { label: "Privacy Policy", href: "/pages/privacy" },
  { label: "Terms of Service", href: "/pages/terms" },
];

export function SiteFooter() {
  return (
    <footer className="w-full bg-cream text-ink">
      <div className="mx-auto max-w-[1500px] px-6 md:px-10 py-14 grid grid-cols-1 gap-10 md:grid-cols-4">
        {/* Column 1 — Glamnetic VIP */}
        <div>
          <h3 className="text-[20px] text-ink mb-3">Glamnetic VIP</h3>
          <p className="text-[14px] text-body mb-6">
            Sign up for emails and texts to be the first to know about exclusive deals, launches &amp; more!
          </p>

          <div className="flex items-center border-b border-line">
            <input
              type="email"
              placeholder="Your Email"
              className="w-full bg-transparent py-2 text-[14px] outline-none placeholder:text-body"
            />
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 text-[13px] uppercase tracking-wide text-ink"
            >
              Join Us
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 flex items-center border-b border-line">
            <input
              type="tel"
              placeholder="Your Phone"
              className="w-full bg-transparent py-2 text-[14px] outline-none placeholder:text-body"
            />
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 text-[13px] uppercase tracking-wide text-ink"
            >
              Join Us
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex gap-3">
            <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" />
            <p className="text-[11px] leading-relaxed text-body italic">
              By submitting this form, you agree to receive recurring automated promotional and personalized marketing
              text messages (e.g. cart reminders) from Glamnetic at the cell number used when signing up. Consent is not
              a condition of any purchase. Reply HELP for help and STOP to cancel. Msg frequency varies. Msg &amp; data
              rates may apply. View{" "}
              <a className="underline" href="/pages/terms">
                Terms
              </a>{" "}
              &amp;{" "}
              <a className="underline" href="/pages/privacy">
                Privacy
              </a>
              .
            </p>
          </div>
        </div>

        {/* Column 2 — Brand */}
        <div>
          <h3 className="text-[18px] text-ink mb-4">Brand</h3>
          <ul>
            {brandLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="block py-1.5 text-[14px] text-body hover:text-ink">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 — Social */}
        <div>
          <h3 className="text-[18px] text-ink mb-4">Social</h3>
          <ul>
            {socialLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="block py-1.5 text-[14px] text-body hover:text-ink">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Download Our App */}
          <h4 className="text-[15px] text-ink mt-8 mb-3">Download Our App</h4>
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
        </div>

        {/* Column 4 — Customer Service */}
        <div>
          <h3 className="text-[18px] text-ink mb-4">Customer Service</h3>
          <ul>
            {customerServiceLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="block py-1.5 text-[14px] text-body hover:text-ink">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom legal bar */}
      <div className="border-t border-line">
        <div className="mx-auto max-w-[1500px] px-6 md:px-10 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <GlamneticLogo className="text-[22px] text-ink" />
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-[13px] text-body hover:text-ink">
                {link.label}
              </a>
            ))}
          </div>
          <span className="text-[12px] text-body">© 2026 Glamnetic</span>
        </div>
      </div>
    </footer>
  );
}
