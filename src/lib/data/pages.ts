// MOCK marketing/info pages. Served through api.getPage() / api.getPageSlugs()
// so a CMS or backend can supply these later without touching the route.
import type { Page } from "@/lib/data/types";

export const PAGES: Page[] = [
  {
    slug: "about",
    title: "About LynxiGlam",
    subtitle: "Salon-worthy nails and lashes, minus the salon.",
    sections: [
      {
        heading: "Our Story",
        body: [
          "LynxiGlam started with one stubborn idea: getting a flawless set of lashes or nails shouldn't cost you an afternoon or a fortune. What began as a search for a magnetic lash that actually held led us to reinvent at-home beauty from the ground up.",
          "Today we design press-on nails, magnetic lashes, and quick-press manicures that go on in minutes, wear for weeks, and look like you just left the chair. No appointments, no glue disasters, no compromise.",
        ],
      },
      {
        heading: "What We Believe",
        body: [
          "Beauty should be fast, forgiving, and fun. Every set is built to be reusable, refill-friendly, and kind to your natural nails and lash line.",
          "We're proudly certified cruelty-free by Leaping Bunny, and we obsess over the details so you can get ready in ten minutes and feel unstoppable for two weeks.",
        ],
      },
      {
        heading: "Made For Everyone",
        body: [
          "From a first-timer nervous about their first press-on to the pro who changes their set every week, LynxiGlam is built to fit real life. Hundreds of shapes, lengths, and styles mean there's a look for every mood.",
        ],
      },
    ],
  },
  {
    slug: "shipping",
    title: "Shipping Information",
    subtitle: "Everything about how and when your order arrives.",
    sections: [
      {
        heading: "Processing Times",
        body: [
          "Orders are processed within 1–2 business days. During new launches, holidays, and promotions, processing can take slightly longer, but we always work to get your glam out the door fast.",
          "You'll receive a confirmation email as soon as your order is placed, and a second email with tracking once it ships.",
        ],
      },
      {
        heading: "Domestic Shipping",
        body: [
          "We offer FREE U.S. economy shipping on orders of $65 or more. Under that, economy shipping is a flat rate calculated at checkout. Expedited and express options are available for when you need your set in a hurry.",
        ],
      },
      {
        heading: "International Shipping",
        body: [
          "We ship to most countries worldwide. International rates and delivery windows are calculated at checkout based on your destination. Please note that duties, taxes, and customs fees are the responsibility of the recipient.",
        ],
      },
    ],
    faq: [
      { q: "When will my order ship?", a: "Most orders leave our warehouse within 1–2 business days. You'll get a tracking email the moment it ships." },
      { q: "Do you offer free shipping?", a: "Yes — U.S. orders of $65+ qualify for free economy shipping automatically at checkout." },
      { q: "How long does delivery take?", a: "U.S. economy delivery typically takes 3–7 business days after shipping. International times vary by destination." },
      { q: "Can I change my shipping address after ordering?", a: "Reach out to our Help Center right away. If your order hasn't shipped yet, we'll do our best to update it." },
      { q: "Who pays customs fees on international orders?", a: "Any duties, taxes, or customs charges are the responsibility of the recipient and are not included in your order total." },
    ],
  },
  {
    slug: "returns",
    title: "Returns & Exchanges",
    subtitle: "Not in love? Here's how to make it right.",
    sections: [
      {
        heading: "Our Policy",
        body: [
          "We want you to love your set. If something isn't right, you may request a return or exchange within 30 days of delivery. For hygiene reasons, lashes and nails must be unused, unopened, and in their original packaging.",
          "Final-sale items, mystery bundles, and gift cards are not eligible for return.",
        ],
      },
      {
        heading: "How To Start a Return",
        body: [
          "Head to our Help Center and submit a return request with your order number and email. Once approved, we'll email you a prepaid label and instructions.",
          "Refunds are issued to your original payment method within 5–10 business days after we receive and inspect your return.",
        ],
      },
      {
        heading: "Damaged or Wrong Items",
        body: [
          "If your order arrives damaged or you received the wrong item, contact us within 7 days with a photo and we'll send a replacement at no cost to you.",
        ],
      },
    ],
    faq: [
      { q: "How long do I have to return an item?", a: "You can request a return or exchange within 30 days of your delivery date." },
      { q: "Can I return an opened set?", a: "For hygiene reasons, lashes and nails must be unused, unopened, and in original packaging to qualify." },
      { q: "How do I start a return?", a: "Submit a request through our Help Center with your order number and email, and we'll send a prepaid label once approved." },
      { q: "When will I get my refund?", a: "Refunds post to your original payment method within 5–10 business days after we receive your return." },
      { q: "What if my order arrived damaged?", a: "Contact us within 7 days with a photo and we'll ship a free replacement." },
    ],
  },
  {
    slug: "help",
    title: "Help Center",
    subtitle: "Answers, fast — so you can get back to glam.",
    sections: [
      {
        heading: "Get In Touch",
        body: [
          "Our support team is here Monday through Friday, 9am–5pm PT. The fastest way to reach us is through the contact form in this Help Center — include your order number and we'll get back to you within one business day.",
        ],
      },
      {
        heading: "Popular Topics",
        body: [
          "Most questions are about order tracking, shipping windows, returns, and application tips. Check the FAQ below or explore our dedicated Shipping, Returns, and How-To Apply pages for step-by-step guidance.",
        ],
      },
    ],
    faq: [
      { q: "How do I contact support?", a: "Use the contact form in the Help Center with your order number. We reply within one business day, Monday–Friday." },
      { q: "Where's my order?", a: "Visit Track My Order and enter your order number and email to see live status, or check the tracking link in your shipping email." },
      { q: "Do you offer discounts?", a: "Yes — join LynxiGlam Rewards and the Insider Plus membership for credits, early access, and members-only pricing." },
      { q: "Are your products cruelty-free?", a: "Absolutely. Every LynxiGlam product is certified cruelty-free by Leaping Bunny." },
    ],
  },
  {
    slug: "track",
    title: "Track My Order",
    subtitle: "Follow your glam from our door to yours.",
    sections: [
      {
        heading: "Find Your Tracking",
        body: [
          "Every order ships with a tracking number sent to the email you used at checkout. Look for a message with the subject line \"Your LynxiGlam order is on the way\" and tap the tracking link inside.",
          "If you created an account, you can also view live status anytime under Order History in your account dashboard.",
        ],
      },
      {
        heading: "Can't Find Your Email?",
        body: [
          "Check your spam and promotions folders first. Still nothing? Contact our Help Center with your order number and we'll resend your tracking details right away.",
        ],
      },
    ],
  },
  {
    slug: "store-locator",
    title: "Store Locator",
    subtitle: "Find LynxiGlam on shelves near you.",
    sections: [
      {
        heading: "Where To Buy",
        body: [
          "Beyond lynxiglam.com, you can shop select LynxiGlam favorites at major beauty retailers nationwide, including Ulta Beauty, Sephora, and Ulta Beauty at Target.",
          "Availability varies by location and season, so we recommend calling ahead to confirm your favorite style is in stock.",
        ],
      },
      {
        heading: "Retail Partners",
        body: [
          "Our retail assortment features best-selling press-on nails, magnetic lashes, and application essentials. For the full catalog — including web-exclusive collections and collabs — shop online.",
        ],
      },
    ],
  },
  {
    slug: "loyalty",
    title: "LynxiGlam Rewards",
    subtitle: "Earn points every time you glam.",
    sections: [
      {
        heading: "How It Works",
        body: [
          "Join LynxiGlam Rewards for free and start earning points on every purchase, review, and referral. Points add up fast and convert straight into store credit at checkout.",
          "Create an account or log in, and your points balance follows you across every order.",
        ],
      },
      {
        heading: "Ways To Earn",
        body: [
          "Earn points for placing orders, writing product reviews, following us on social, celebrating your birthday, and referring friends. The more you engage, the faster your rewards grow.",
        ],
      },
      {
        heading: "Redeem Your Points",
        body: [
          "Cash in your points for discounts on future orders — you choose how much to apply at checkout. Points never expire as long as your account stays active.",
        ],
      },
    ],
  },
  {
    slug: "membership",
    title: "LynxiGlam Insider Plus",
    subtitle: "Our members-only club for serious glam.",
    sections: [
      {
        heading: "Membership Perks",
        body: [
          "Insider Plus is our premium membership built for regulars. Members earn 15% back in store credit on every order, enjoy free U.S. shipping with no minimum, and unlock early access to new launches before anyone else.",
          "You'll also get a $10 welcome credit and a free nail set at sign-up — a value that covers your membership on day one.",
        ],
      },
      {
        heading: "How To Join",
        body: [
          "Sign up in seconds during checkout or from your account dashboard. Your perks activate immediately, and you can manage or cancel your membership anytime.",
        ],
      },
      {
        heading: "Is It Worth It?",
        body: [
          "If you restock more than a couple times a year, the store credit and free shipping typically pay for the membership several times over. Do the math — most members come out ahead fast.",
        ],
      },
    ],
  },
  {
    slug: "glamfam",
    title: "VIP GlamFam Group",
    subtitle: "Where the LynxiGlam community lives.",
    sections: [
      {
        heading: "Join The GlamFam",
        body: [
          "The VIP GlamFam Group is our private community of nail and lash lovers who get first looks, insider polls, and exclusive drops. It's the place to share your sets, swap application hacks, and help shape what we make next.",
        ],
      },
      {
        heading: "Member Benefits",
        body: [
          "GlamFam members vote on upcoming shades, test early launches, and score surprise perks throughout the year. Your feedback goes straight to our design team.",
          "Membership is free — just join the group and introduce your favorite look.",
        ],
      },
    ],
  },
  {
    slug: "wholesale",
    title: "Wholesale & Partnerships",
    subtitle: "Bring LynxiGlam to your shelves.",
    sections: [
      {
        heading: "Stock LynxiGlam",
        body: [
          "We partner with salons, boutiques, and beauty retailers who want to offer their customers salon-quality press-ons and magnetic lashes. Our wholesale program includes competitive pricing, marketing support, and a curated best-seller assortment.",
        ],
      },
      {
        heading: "Who We Work With",
        body: [
          "From independent nail studios to national chains, we tailor our program to fit your business. Minimum order quantities and tiered pricing are available on request.",
        ],
      },
      {
        heading: "Apply To Partner",
        body: [
          "Ready to carry LynxiGlam? Submit a wholesale inquiry with your business details and our partnerships team will follow up within 3–5 business days.",
        ],
      },
    ],
  },
  {
    slug: "apply",
    title: "How To Apply Press-Ons",
    subtitle: "A flawless set in about ten minutes.",
    sections: [
      {
        heading: "Prep Your Nails",
        body: [
          "Start with clean, dry, oil-free nails. Push back your cuticles, lightly buff the surface of each natural nail, and wipe with the included prep pad. A little prep is the secret to long-lasting wear.",
        ],
      },
      {
        heading: "Size & Place",
        body: [
          "Lay out your press-ons and match each one to a natural nail — pick a size that covers the nail without touching the skin. Apply a thin, even layer of glue to both your natural nail and the press-on for the strongest hold.",
          "Press each nail on at a slight downward angle toward the cuticle, then hold firmly for 15–20 seconds.",
        ],
      },
      {
        heading: "Finish & Shape",
        body: [
          "Once all ten are set, gently file to your preferred length and shape. Avoid water and heavy hand-washing for the first hour to let the glue fully cure.",
        ],
      },
    ],
    faq: [
      { q: "How long does application take?", a: "Most people finish a full set in about ten minutes once they've done it a couple of times." },
      { q: "How long will my press-ons last?", a: "With proper prep and glue application, a set can last up to two weeks." },
      { q: "What if a nail doesn't fit perfectly?", a: "Choose the closest size that doesn't touch your skin, then file the sides and free edge to customize the fit." },
      { q: "Can I reuse my press-ons?", a: "Yes — remove them gently, clean off old glue, and store them in the tray for another wear." },
      { q: "Do I have to use glue?", a: "Glue gives the longest hold, but adhesive tabs are a great no-glue option for shorter, gentler wear." },
    ],
  },
  {
    slug: "remove",
    title: "How To Remove Press-Ons",
    subtitle: "Take them off safely — no damage, no drama.",
    sections: [
      {
        heading: "The Soak Method",
        body: [
          "Fill a bowl with warm, soapy water and soak your fingertips for 10–15 minutes. This loosens the adhesive so your press-ons lift away without pulling on your natural nail.",
          "Gently wiggle each nail free from the sides. Never force or pry — if one resists, soak a little longer.",
        ],
      },
      {
        heading: "Clean & Condition",
        body: [
          "Once removed, buff away any leftover glue and wash your hands. Follow with cuticle oil or a nourishing hand cream to rehydrate your nails and skin.",
        ],
      },
      {
        heading: "Save For Next Time",
        body: [
          "Peel any remaining adhesive off the press-ons, wipe them clean, and store them back in the tray. Cared-for sets can be worn again and again.",
        ],
      },
    ],
    faq: [
      { q: "How do I remove press-ons without damaging my nails?", a: "Soak in warm, soapy water for 10–15 minutes, then gently wiggle each nail free — never force or pry." },
      { q: "Can I use acetone?", a: "A brief soak in acetone or remover can speed things up, but warm soapy water is gentler on your natural nails." },
      { q: "A nail won't budge — what do I do?", a: "Soak longer. Forcing it can peel layers off your natural nail, so patience is key." },
      { q: "How do I care for my nails after removal?", a: "Buff off leftover glue and apply cuticle oil or hand cream to rehydrate." },
    ],
  },
  {
    slug: "quick-press-tips",
    title: "Quick Press Mani Application Tips",
    subtitle: "Pro tricks for your fastest, longest-lasting set yet.",
    sections: [
      {
        heading: "Prep Like A Pro",
        body: [
          "Your manicure is only as good as your prep. Clean, buff, and dehydrate each nail before you start — even a trace of oil or lotion can cut your wear time in half.",
        ],
      },
      {
        heading: "Nail The Application",
        body: [
          "Work one hand at a time so nothing slips before it sets. Apply firm, even pressure from cuticle to tip and hold each nail longer than you think you need to. A tight, bubble-free bond is what makes a Quick Press Mani last.",
        ],
      },
      {
        heading: "Make It Last",
        body: [
          "Wear gloves for dishes and cleaning, keep your hands out of long hot soaks, and swipe on cuticle oil daily to keep edges from lifting. Small habits add days of wear.",
        ],
      },
    ],
    faq: [
      { q: "How long does a Quick Press Mani last?", a: "With good prep and daily care, most sets wear beautifully for up to two weeks." },
      { q: "How do I stop my nails from lifting early?", a: "Dehydrate before applying, hold firm pressure while setting, and wear gloves for wet work." },
      { q: "Can I shower with my Quick Press Mani?", a: "Yes — just avoid long, hot soaks in the first 24 hours while the adhesive fully cures." },
      { q: "What's the biggest application mistake?", a: "Skipping prep. Any leftover oil or lotion dramatically shortens how long your set holds." },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    subtitle: "The fine print for using LynxiGlam.",
    sections: [
      {
        heading: "Agreement To Terms",
        body: [
          "By accessing or purchasing from lynxiglam.com, you agree to these Terms of Service and all policies referenced within them. If you do not agree, please do not use the site.",
          "We may update these terms from time to time. Continued use of the site after changes are posted constitutes your acceptance of the revised terms.",
        ],
      },
      {
        heading: "Orders & Pricing",
        body: [
          "All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order, and to correct pricing errors even after an order has been placed. Prices and promotions are subject to change without notice.",
        ],
      },
      {
        heading: "Intellectual Property",
        body: [
          "All content on this site — including logos, imagery, product designs, and copy — is the property of LynxiGlam and protected by applicable intellectual property laws. You may not reproduce or reuse it without written permission.",
        ],
      },
      {
        heading: "Limitation Of Liability",
        body: [
          "LynxiGlam is not liable for any indirect or incidental damages arising from the use of our products or site. Our products are intended for cosmetic use only; discontinue use if irritation occurs.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    subtitle: "How we collect, use, and protect your information.",
    sections: [
      {
        heading: "Information We Collect",
        body: [
          "We collect information you provide directly — such as your name, email, shipping address, and payment details — as well as data gathered automatically, like your device type, browsing activity, and cookies.",
        ],
      },
      {
        heading: "How We Use Your Data",
        body: [
          "Your information helps us process orders, provide customer support, personalize your experience, and send updates you've opted into. We never sell your personal data.",
          "You can unsubscribe from marketing emails at any time using the link in any message.",
        ],
      },
      {
        heading: "Cookies & Tracking",
        body: [
          "We use cookies and similar technologies to keep your cart, remember preferences, and understand how the site is used. You can manage cookie preferences through your browser settings.",
        ],
      },
      {
        heading: "Your Rights",
        body: [
          "Depending on where you live, you may have the right to access, correct, or delete your personal information. To make a request, contact us through our Help Center and we'll respond in line with applicable law.",
        ],
      },
    ],
  },
];
