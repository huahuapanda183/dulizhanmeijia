// i18n dictionary. The ENGLISH string is the key; `zh` holds the translation.
// Missing keys fall back to the English key itself, so partial translation is safe.
export type Locale = "en" | "zh";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
];

export const zh: Record<string, string> = {
  // Nav (top-level)
  "SHOP ALL": "全部商品",
  "GLUE-ON NAILS": "穿戴甲",
  "QUICK PRESS MANI": "快速穿戴",
  "LASHES": "假睫毛",
  "BUNDLES": "套装组合",
  "LOYALTY": "会员福利",

  // Header actions / labels
  Account: "账户",
  Search: "搜索",
  Wishlist: "心愿单",
  Cart: "购物袋",
  Admin: "管理后台",

  // Announcement
  "FREE SHIPPING IN THE US + CANADA ON ORDERS $65+ USD": "美国及加拿大满 $65 免运费",
  "SCORE FREE U.S. ECONOMY SHIPPING — USE CODE: FREESHIP": "美国经济型运费免费 — 使用优惠码 FREESHIP",
  "BUY MORE, SAVE MORE — BUILD YOUR OWN BUNDLE": "买得越多省得越多 — 自由搭配套装",

  // Homepage section headings
  "Our Best Sellers": "热销爆款",
  "Our Reviews": "顾客评价",
  "Shop All Press-On Nails": "全部穿戴甲",
  "As Seen On": "媒体报道",
  "Shop Us IRL": "线下门店",

  // Common CTAs
  "Add to Bag": "加入购物袋",
  "Sold Out": "已售罄",
  "Shop All": "全部商品",
  "Shop Now": "立即选购",
  "Find Us": "查找门店",
  "View Bag": "查看购物袋",
  Checkout: "去结算",
  "Continue Shopping": "继续购物",

  // Cart
  "Your Bag": "我的购物袋",
  Subtotal: "小计",
  "Your bag is empty": "购物袋是空的",
  "Order Summary": "订单摘要",
  "Shipping & taxes calculated at checkout.": "运费与税费将在结算时计算。",
  "Shipping & taxes calculated at checkout": "运费与税费将在结算时计算",

  // Footer
  "LynxiGlam VIP": "LynxiGlam 会员",
  "Sign up for emails and texts to be the first to know about exclusive deals, launches & more!":
    "订阅邮件与短信，第一时间获取专属优惠、新品上线等资讯！",
  Brand: "品牌",
  Social: "社交媒体",
  "Customer Service": "客户服务",
  "Download Our App": "下载我们的 App",
  "Your Email": "你的邮箱",
  "Your Phone": "你的手机号",
  "Join Us": "加入",

  // Filters / collection
  FILTERS: "筛选",
  Shape: "甲形",
  Type: "类型",
  Price: "价格",
  Availability: "库存",
  "In stock only": "仅显示有货",
  "Clear all": "清除全部",
  "Sort by": "排序",
  products: "件商品",
};

export function translate(locale: Locale, key: string): string {
  if (locale === "zh") return zh[key] ?? key;
  return key;
}
