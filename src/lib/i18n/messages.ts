// i18n dictionary. The ENGLISH string is the key; `zh` holds the translation.
// Missing keys fall back to the English key itself, so partial translation is safe.
export type Locale = "en" | "zh";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
];

export const zh: Record<string, string> = {
  // --- 数据库来源的集合标题/描述（经 <T> 渲染）---
  // 由 scripts/check-i18n-coverage.mjs 守护：漏译会让中文页静默显示英文，
  // 因为 translate() 是 `zh[key] ?? key`，查不到就原样返回、不报错。
  // 联名 IP 与品牌名保留原文（Harry Potter™ / Hello Kitty® / Glamzilla / Fanatics
  // 是受商标保护的专有名称，不应翻译）。
  "Best Sellers": "热卖单品",
  "Quick Press Mani": "快贴美甲",
  "LynxiGlam x Glamzilla": "LynxiGlam x Glamzilla 联名",
  "Harry Potter™ x LynxiGlam": "Harry Potter™ x LynxiGlam 联名",
  "Hello Kitty® and Friends": "Hello Kitty® and Friends 联名",
  "LynxiGlam x Fanatics": "LynxiGlam x Fanatics 联名",
  "GLAMSQUAD FOREVER — by the squad, for the squad.": "GLAMSQUAD FOREVER —— 由姐妹团打造，为姐妹团而生。",

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

  // Admin
  Dashboard: "仪表盘",
  Products: "商品",
  Collections: "集合",
  Orders: "订单",
  Customers: "客户",
  Analytics: "数据分析",
  "Back to store": "返回商城",
  "Sign out": "退出登录",
  "Overview of your store": "店铺概览",
  Product: "商品",
  Image: "图片",
  Rating: "评分",
  Status: "状态",
  Active: "在售",
  Views: "浏览",
  Clicks: "点击",
  "Add to Cart": "加购",
  "Click Rate": "点击率",
  Conversion: "转化率",
  "Product Analytics": "商品数据分析",
  "Per-product views, clicks and add-to-cart.": "各商品的浏览、点击与加购数据。",
  "Total Views": "总浏览",
  "Total Clicks": "总点击",
  "Total Add to Cart": "总加购",
  "Top Products": "热门商品",
  "Recent Products": "最新商品",
  "View all": "查看全部",
  "Avg Rating": "平均评分",
  "Revenue (demo)": "营收（演示）",
  Draft: "草稿",
  reviews: "条评价",
  collections: "个集合",
  "Search products…": "搜索商品…",
  "Search by title, handle, or shape…": "按名称、标识或甲形搜索…",
  Edit: "编辑",
  Action: "操作",
  "No products match": "没有匹配的商品：",
  of: "／共",
  "No products found.": "未找到商品。",
  "View": "查看",
  Title: "标题",
  Handle: "标识",
  "No orders yet": "暂无订单",
  "No customers yet": "暂无客户",
  "Orders will appear here once a payment backend is connected.": "接入支付后端后，订单将显示在这里。",
  "Customers will appear here once the backend is connected.": "接入后端后，客户将显示在这里。",
  "Manage your catalog — search, review, and edit products.": "管理你的商品目录——搜索、查看与编辑商品。",
  "Track and fulfill customer orders.": "跟踪并履行客户订单。",
  "View and manage your customer base.": "查看与管理你的客户群。",
  "Customer profiles will appear here once accounts and a payment backend are connected.": "接入账户与支付后端后，客户资料将显示在这里。",
  "collections in your store.": "个集合。",
  "Reset data": "重置数据",
  "No analytics yet — browse the storefront to generate data.": "暂无数据 — 去前台浏览商品即可生成数据。",

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
  product: "件商品",
  Filter: "筛选",
  "View results": "查看结果",
  Home: "首页",
  "No products match your filters.": "没有符合筛选条件的商品。",
  // Sort options
  Featured: "推荐",
  "Best selling": "最畅销",
  "Best Selling": "最畅销",
  "Price: Low to High": "价格：从低到高",
  "Price: High to Low": "价格：从高到低",
  "Top rated": "好评优先",
  "Highest Rated": "好评优先",
  Newest: "最新上架",

  // Search
  "Search press-on nails, bundles, collections…": "搜索穿戴甲、套装、系列…",
  "No matches yet — press Enter to search all products.": "暂无匹配 — 按回车搜索全部商品。",
  "See all results for": "查看全部结果：",
  "Search results": "搜索结果",
  "results for": "个结果，关键词：",
  "No results for": "未找到结果：",
  for: "，关键词：",
  "Try another search.": "换个关键词试试。",
  "Enter a search term to find products.": "输入关键词以查找商品。",
  "Up to": "最高",
  Qty: "数量",
  result: "个结果",
  results: "个结果",

  // Wishlist
  "Your Wishlist": "我的心愿单",
  "Your wishlist is empty": "心愿单为空",

  // Cart page
  Remove: "移除",

  // Footer links
  Login: "登录",
  About: "关于我们",
  Blog: "博客",
  "VIP GlamFam Group": "VIP GlamFam 社群",
  Reviews: "评价",
  Membership: "会员",
  Wholesale: "批发合作",
  "Help Center": "帮助中心",
  Shipping: "配送",
  "Track My Order": "订单查询",
  Returns: "退换货",
  "How To Apply Press-Ons": "穿戴甲上手教程",
  "How To Remove Press-Ons": "穿戴甲卸除教程",
  "Quick Press Mani Application Tips": "快速穿戴上手技巧",
  "Store Locator": "门店查询",
  "Returns & Refunds": "退换与退款",
  "Privacy Policy": "隐私政策",
  "Terms of Service": "服务条款",

  // Category / promo / feature cards
  "Shop Glue On Nails": "选购穿戴甲",
  "Shop Quick Press Mani": "选购快速穿戴",
  "Shop Accessories": "选购配件",
  "Shop Lashes": "选购假睫毛",
  "Free Shipping": "免运费",
  "New: Sparkling Gems": "新品：闪耀宝石",
  "NEW: Sandal Season Collection": "新品：凉鞋季系列",
  "NEW STYLES ADDED: Glam Icons": "新增款式：Glam Icons",
  "Join Our Membership Program": "加入会员计划",
  "Join the GlamFam Community": "加入 GlamFam 社群",

  // Product shapes
  "Short Oval": "短椭圆",
  "Short Almond": "短杏仁",
  "Short Squoval": "短方圆",
  "Medium Almond": "中长杏仁",
  "Medium Oval": "中长椭圆",
  "Short Coffin": "短棺形",
  "Full Collection Bundle": "全系列套装",
  Bundle: "套装",
  "Nail Adhesive": "美甲胶",
  "Nail Care": "指甲护理",
  "Nail Tool": "美甲工具",
  "Magnetic Lashes": "磁吸假睫毛",
  "Magnetic Liner": "磁吸眼线",

  // Product features + membership
  "10 Minute\nApplication": "10 分钟\n轻松上手",
  "Up to 2 Weeks\nWear": "佩戴长达\n两周",
  "Salon Quality": "沙龙级品质",
  "Certified by\nLeaping Bunny": "通过\nLeaping Bunny 认证",
  "Earn 15% back in store credit on all orders": "所有订单返 15% 店铺积分",
  "FREE U.S. shipping on all orders": "美国全场免运费",
  "$10 Welcome credit": "$10 新人礼金",
  "FREE nail at sign-up ($15.99 value)": "注册即送 1 副美甲（价值 $15.99）",
  "Exclusive early access to new launches": "新品抢先购",

  // PDP
  Description: "商品详情",
  "Join LynxiGlam Insider Plus Membership": "加入 LynxiGlam Insider Plus 会员",
  "Sign Up Now – $59.99/YR": "立即加入 – $59.99/年",
  "Learn more": "了解更多",
  "Pay over time for orders over $35.00 with": "满 $35.00 订单可分期付款，使用",
  "You May Also Like": "你可能还喜欢",
  "Write a Review": "写评价",
  "Verified Buyer": "已验证买家",
  "Based on": "基于",
  "review(s)": "条评价",
  Reviewing: "评价了",
  "No reviews yet — be the first to review this product.": "暂无评价——来做第一个评价的人吧。",

  // Collection titles
  "Glue-On Nails": "穿戴甲",
  "Press-On Nails": "穿戴甲",
  "New Nail Arrivals": "美甲新品",
  "Nail Bundles & Sets": "美甲套装",
  "Nail Accessories Bundles": "美甲配件套装",
  "Sparkling Gems": "闪耀宝石",
  "Sandal Season": "凉鞋季",
  "Glam Icons": "Glam Icons",
  "Euro Summer": "欧陆夏日",
  "French Tips": "法式美甲",
  "Nail Collabs": "美甲联名",
  "Nail Accessories": "美甲配件",
  "Lashes & Liner": "假睫毛与眼线",
  "Magnetic Liners": "磁吸眼线",
  "Best Selling Lashes": "热销假睫毛",
  "Shop All LynxiGlam Products": "全部 LynxiGlam 商品",

  // Account
  "Sign In": "登录",
  "Create Account": "创建账户",
  Email: "邮箱",
  Password: "密码",
  "First name": "名",
  "Last name": "姓",
  "New here? Create an account": "还没有账户？立即注册",
  "Already have an account? Sign in": "已有账户？点此登录",

  // Checkout
  Contact: "联系方式",
  "Shipping address": "收货地址",
  Address: "详细地址",
  "Apartment, suite, etc. (optional)": "公寓 / 单元等（选填）",
  City: "城市",
  "State / Province": "省 / 州",
  "ZIP / Postal code": "邮政编码",
  Country: "国家 / 地区",
  "Phone (optional)": "电话（选填）",
  "Shipping method": "配送方式",
  Payment: "支付",
  "Demo checkout — no real payment is processed.": "演示结算——不会真实扣款。",
  "Card number": "卡号",
  Expiry: "有效期",
  CVC: "安全码",
  "Place Order": "提交订单",
  "Placing Order…": "提交中…",
  "Promo code": "优惠码",
  Apply: "应用",
  Discount: "折扣",
  "Tax (est.)": "税费（预估）",
  Tax: "税费",
  Total: "合计",
  FREE: "免费",
  "Loading shipping options…": "正在加载配送方式…",
  "Couldn't load shipping options. Please refresh and try again.":
    "配送方式加载失败，请刷新后重试。",
  "Couldn't check that code. Please try again.": "优惠码校验失败，请重试。",
  "Standard (5–7 business days)": "标准配送（5–7 个工作日）",
  "Express (2–3 business days)": "加急配送（2–3 个工作日）",
  Overnight: "次日达",
  "5–7 business days": "5–7 个工作日",
  "2–3 business days": "2–3 个工作日",
  "1 business day": "1 个工作日",

  // Confirmation
  "Thank you for your order!": "感谢您的下单！",
  Order: "订单",
  "A confirmation was sent to": "确认邮件已发送至",
  "No recent order": "暂无最近订单",

  // Bundle builder
  "Build Your Own Nail Bundle": "自由搭配美甲套装",
  "Mix & match your favorite sets to build a bundle in your own style.":
    "自由搭配你喜爱的套组，组出属于你的风格。",
  Add: "加入",
  "Add Bundle to Bag": "套装加入购物袋",
  "You're saving": "已省",
  "items in bundle": "件已加入套装",
  "item in bundle": "件已加入套装",

  // Membership card headings on PDP
  "Salon-worthy nails and lashes, minus the salon.": "沙龙级美甲与睫毛，无需去沙龙。",

  // Collection descriptions
  "Every press-on nail set, lash, bundle and accessory.": "全部穿戴甲、假睫毛、套装与配件。",
  "The full LynxiGlam lineup — nails, lashes, liners and accessories.": "完整的 LynxiGlam 产品线——美甲、假睫毛、眼线与配件。",
  "Reusable press-on nails in every shape and style.": "各种甲形与风格的可重复使用穿戴甲。",
  "Salon-quality press-on nails.": "沙龙级穿戴甲。",
  "Our most-loved sets.": "我们最受欢迎的套组。",
  "Just dropped.": "刚刚上新。",
  "Buy more, save more.": "买得越多，省得越多。",
  "Everything you need to apply and remove, bundled.": "上手与卸除所需一站备齐。",
  "Jewel-toned press-on nails.": "宝石色调穿戴甲。",
  "Summer-ready shades for fingers and toes.": "手脚皆宜的夏日色系。",
  "New shapes. More styles to love.": "新甲形，更多心动款式。",
  "Sun-soaked summer shades.": "阳光满满的夏日色。",
  "Timeless French manicures.": "经典法式美甲。",
  "Limited-edition collaborations.": "限量联名系列。",
  "Cast a spell with the Wizarding World collection.": "用魔法世界系列施展你的魔法。",
  "Supercute press-on nails with Hello Kitty and Friends.": "Hello Kitty 与朋友们的超萌穿戴甲。",
  "Rep your team in style.": "时尚应援你支持的球队。",
  "Our fastest mani yet.": "迄今最快的美甲方式。",
  "Glue, removers and tools.": "胶水、卸除液与工具。",
  "Reusable magnetic lashes and liners.": "可重复使用的磁吸假睫毛与眼线。",
  "Reusable magnetic lashes — no glue needed.": "可重复使用磁吸假睫毛——无需胶水。",
  "The liner that holds your lashes all day.": "全天固定假睫毛的磁吸眼线。",
  "Our most-loved lashes and liners.": "我们最受欢迎的假睫毛与眼线。",

  // Product descriptions
  "Reusable press-on nails that go on in minutes and last up to two weeks. Each set includes 30 nails, nail glue, a nail file, cuticle stick and alcohol pad — everything you need for a salon-quality manicure at home.":
    "可重复使用的穿戴甲，几分钟即可佩戴，最长可持久两周。每套含 30 片美甲、美甲胶、指甲锉、推皮棒与酒精棉片——在家轻松打造沙龙级美甲所需一应俱全。",
  "Glazed white French tips on a sheer nude base. Reusable press-on nails that go on in minutes and last up to two weeks. Each set includes 30 nails, nail glue, a nail file, cuticle stick and alcohol pad — everything you need for a salon-quality manicure at home.":
    "透明裸色打底、白色亮面法式甲尖。可重复使用的穿戴甲，几分钟即可佩戴，最长可持久两周。每套含 30 片美甲、美甲胶、指甲锉、推皮棒与酒精棉片——在家轻松打造沙龙级美甲所需一应俱全。",
  "The complete Sparkling Gems bundle — every jewel-toned set in one collection. Reusable press-on nails that go on in minutes and last up to two weeks. Each set includes 30 nails, nail glue, a nail file, cuticle stick and alcohol pad — everything you need for a salon-quality manicure at home.":
    "完整的闪耀宝石套装——所有宝石色调套组一次拥有。可重复使用的穿戴甲，几分钟即可佩戴，最长可持久两周。每套含 30 片美甲、美甲胶、指甲锉、推皮棒与酒精棉片——在家轻松打造沙龙级美甲所需一应俱全。",
  "A LynxiGlam essential for a flawless, long-lasting press-on manicure at home.":
    "LynxiGlam 必备单品，在家打造无瑕、持久的穿戴甲美甲。",
  "Reusable magnetic lashes that apply in seconds with no glue — just pair with a magnetic liner. Wear each pair up to 60 times.":
    "可重复使用的磁吸假睫毛，无需胶水、几秒即可佩戴——只需搭配磁吸眼线。每副可佩戴多达 60 次。",
  "The magnetic liner that holds LynxiGlam lashes in place all day. Smudge-proof, easy to apply and easy to remove.":
    "全天固定 LynxiGlam 假睫毛的磁吸眼线。防晕染，易上手、易卸除。",
};

export function translate(locale: Locale, key: string): string {
  if (locale === "zh") return zh[key] ?? key;
  return key;
}
