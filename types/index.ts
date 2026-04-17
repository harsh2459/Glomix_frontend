// =====================================================
// SHARED TYPES — Glomix Frontend
// Mirrors backend src/types/index.ts
// =====================================================

export type AdminRole = 'super_admin' | 'manager';

export type AdminPermission =
  | 'dashboard' | 'products' | 'product-templates' | 'categories'
  | 'orders' | 'customers' | 'coupons' | 'banners' | 'reviews'
  | 'blog' | 'pages' | 'team' | 'settings';

export interface IAdmin {
  _id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin?: string;
  createdAt: string;
  permissions: AdminPermission[];
}

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: IAddress[];
  wishlist: string[] | IProduct[];
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface IProductVariant {
  name: string;
  value: string;
  price?: number;
  salePrice?: number;
  stock: number;
  sku?: string;
}

export interface IProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  ogImage?: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: string | ICategory;
  subcategory?: string;
  images: string[];
  price: number;
  salePrice?: number;
  stock: number;
  variants: IProductVariant[];
  shortDescription?: string;
  description: string;
  ingredients?: string;
  howToUse?: string;
  benefits: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  templateId?: string | IProductTemplate;
  customFields?: Record<string, unknown>;
  productLayout?: ITemplateLayout | null;  // per-product layout override
  seo: IProductSEO;
  createdAt: string;
}

export interface ITemplateField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'boolean' | 'tags';
  options: string[];
  placeholder: string;
  unit: string;
  helpText: string;
  required: boolean;
  order: number;
}

export type SectionType =
  | 'image_gallery' | 'product_header' | 'key_specs'
  | 'description' | 'custom_fields_table' | 'ingredients'
  | 'how_to_use' | 'benefits' | 'image_strip' | 'related_products';

export type ImageDisplay = 'slider' | 'grid-2' | 'grid-3' | 'stack' | 'hero-grid' | 'masonry';
export type ImageAspect = '1:1' | '4:3' | '3:4' | '16:9';

export interface ILayoutSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  order: number;
  label?: string;
  fields?: string[];
  config?: {
    imageDisplay?: ImageDisplay;
    imageAspect?: ImageAspect;
    [key: string]: unknown;
  };
}

export interface ITemplateLayout {
  imagePosition: 'left' | 'right';
  imageRatio: '50-50' | '55-45' | '40-60';
  keySpecFields: string[];
  sections: ILayoutSection[];
}

export interface IProductTemplate {
  _id: string;
  name: string;
  emoji: string;
  description: string;
  fields: ITemplateField[];
  isDefault: boolean;
  layout: ITemplateLayout;
  pageTemplate?: string;  // custom raw HTML template
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parent?: string | ICategory;
  description?: string;
  isActive: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
  };
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay' | 'cod';

export interface IOrderItem {
  product: string | IProduct;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: { name: string; value: string };
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  user: string | IUser;
  items: IOrderItem[];
  shippingAddress: IAddress;
  subtotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  orderStatus: OrderStatus;
  shiprocketOrderId?: string;
  awb?: string;
  shippingPartner?: string;
  trackingUrl?: string;
  timeline: { status: string; message: string; timestamp: string }[];
  createdAt: string;
}

export interface IReview {
  _id: string;
  product: string | IProduct;
  user: string | IUser;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ICoupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface IBanner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  position: 'hero' | 'mid' | 'popup' | 'announcement';
  isActive: boolean;
  order: number;
  backgroundColor?: string;
  textColor?: string;
  ctaText?: string;
}

export interface IThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  fontFamily: string;
  headingFontFamily: string;
  borderRadius: string;
  buttonStyle: 'rounded' | 'sharp' | 'pill';
}

export interface IHomepageSection {
  id: string;
  name: string;
  isEnabled: boolean;
  order: number;
  config?: Record<string, unknown>;
}

export interface IFooterColumn {
  title: string;
  links: { label: string; url: string }[];
}

export interface INavLink {
  label: string;
  href: string;
  order: number;
  subLinks?: { label: string; href: string; order: number }[];
}

export interface IHeroTrustBadge {
  icon: string;
  text: string;
  order: number;
}

export interface IUSPItem {
  iconName: string;
  title: string;
  desc: string;
  order: number;
}

export interface IFooterPolicyLink {
  label: string;
  url: string;
  order: number;
}

export interface ISiteSettings {
  _id: string;
  siteName: string;
  logo?: string;
  favicon?: string;
  theme: IThemeSettings;
  homepageSections: IHomepageSection[];
  navLinks: INavLink[];
  heroTrustBadges: IHeroTrustBadge[];
  uspStrip: IUSPItem[];
  newsletterTitle: string;
  newsletterSubtitle: string;
  footerColumns: IFooterColumn[];
  footerPolicyLinks: IFooterPolicyLink[];
  footerCopyright: string;
  footerDescription?: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    pinterest?: string;
    whatsapp?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  currency: string;
  currencySymbol: string;
  seo: {
    siteTitle: string;
    siteDescription: string;
    siteKeywords: string[];
    ogImage?: string;
    twitterHandle?: string;
    googleVerification?: string;
  };
  announcementBar: {
    isEnabled: boolean;
    text: string;
    backgroundColor: string;
    textColor: string;
    link?: string;
  };
  maintenanceMode: boolean;
  robotsTxt?: string;
  customHeadScripts?: string;
}

export interface IBlog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
    ogImage?: string;
  };
}

// Cart types (client-side only, managed by Zustand)
export interface CartItem {
  product: IProduct;
  quantity: number;
  variant?: { name: string; value: string };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
