// ─── Enums ───────────────────────────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export enum AddressLabel {
  HOME = 'HOME',
  OFFICE = 'OFFICE',
  WORK = 'WORK',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  INITIATED = 'INITIATED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  PACKING = 'PACKING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum CouponDiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  GHS = 'GHS',
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Matches backend AuthResponse */
export interface AuthResponse {
  id: number;
  email: string;
  fullName: string;
  profilePicture: string | null;
  role: UserRole;
}

/** POST /api/v1/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /api/v1/auth/register */
export interface RegistrationRequest {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

/** POST /api/v1/auth/verify-otp */
export interface OtpVerificationRequest {
  email: string;
  otp: string;
}

/** POST /api/v1/auth/forgot-password, POST /api/v1/auth/resend-otp */
export interface EmailRequest {
  email: string;
}

/** POST /api/v1/auth/reset-password */
export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

/** Matches backend CategoryResponse */
export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  description: string;
  slug: string;
}

/** POST/PUT category */
export interface CategoryRequest {
  categoryName: string;
  description: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────

/** Matches backend ProductListing (used in paginated listing) */
export interface ProductListing {
  productId: number;
  productName: string;
  productShortDescription: string;
  productImageUrl: string;
  categoryName: string;
  price: string;
  stockQuantity: number;
  isOutOfStock: boolean;
  slug: string;
}

/** Matches backend ProductDetailsPageResponse (public detail page) */
export interface ProductDetailsPageResponse {
  productId: number;
  productName: string;
  productShortDescription: string;
  productDescription: string;
  productImageUrl: string;
  category: string;
  sellingPrice: string;
  isOutOfStock: boolean;
  isFeatured: boolean;
  slug: string;
}

/** Matches backend ProductDetails (admin detail) */
export interface ProductDetails {
  productId: number;
  productName: string;
  productShortDescription: string;
  productDescription: string;
  productImageUrl: string;
  category: CategoryResponse;
  sellingPrice: string;
  costPrice: string;
  stockKeepingUnit: string;
  isOutOfStock: boolean;
  soldCount: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  slug: string;
}

/** multipart/form-data for creating/updating a product */
export interface ProductRequest {
  productName: string;
  productDescription: string;
  shortDescription: string;
  stockKeepingUnit?: string;
  currency: Currency;
  sellingPrice: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  categoryId: number;
  isActive?: boolean;
  isFeatured?: boolean;
  productImage?: File;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  numberOfElements: number;
  isFirst: boolean;
  isLast: boolean;
  isEmpty: boolean;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItemResponse {
  cartItemId: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: string;
  quantity: number;
}

export interface CartResponse {
  cartItems: CartItemResponse[];
  totalPrice: string;
}

/** POST /api/v1/cart/items/add-item */
export interface CartItemRequest {
  productId: number;
  quantity: number;
}

/** PUT /api/v1/cart/items/update/{cartItemId} */
export interface CartItemUpdateRequest {
  quantity: number;
}

/** POST /api/v1/cart/populate */
export interface PopulateCartItemRequest {
  cartItems: CartItemRequest[];
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface OrderItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface OrderResponse {
  orderId: number;
  orderNumber: string;
  subtotal: string;
  discountAmount: string;
  totalAmount: string;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  lineItems: OrderItemResponse[];
  orderDate: string;
  deliveryDetail?: DeliveryDetailResponse;
  /** Tax breakdown returned by the order detail endpoint */
  taxes?: TaxCalculationResult;
}

export interface OrderListResponse {
  orderId: number;
  orderNumber: string;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  totalAmount: string;
  orderDate: string;
}

/** PUT /api/v1/order/update-order-status/{orderNumber} */
export interface OrderStatusUpdateRequest {
  orderStatus: DeliveryStatus;
}

// ─── Delivery Details ─────────────────────────────────────────────────────────

/** POST/PUT delivery detail */
export interface DeliveryDetailRequest {
  recipientName: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  landmark: string;
  label?: AddressLabel;
  isDefault?: boolean;
}

export interface DeliveryDetailResponse {
  id: number;
  recipientName: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  landmark: string;
  label: AddressLabel;
  isDefault: boolean;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

export interface CouponRequest {
  couponCode?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maximumDiscountAmount: number;
  minimumCartAmountForDiscount: number;
  usageLimit: number;
  isActive: boolean;
  startDate: string;      // ISO date e.g. "2026-01-01"
  expirationDate: string; // ISO date e.g. "2026-12-31"
}

export interface CouponDetailResponse {
  couponId: number;
  couponCode: string;
  isActive: boolean;
  discountType: CouponDiscountType;
  usageLimit: number;
  usageCount: number;
  discountValue: number;
  maximumDiscountAmount: number;
  minimumCartAmountForDiscount: number;
  startDate: string;
  expirationDate: string;
}

export interface CouponListResponse {
  couponId: number;
  couponCode: string;
  isActive: boolean;
  discountType: CouponDiscountType;
  usageLimit: number;
  usageCount: number;
  expirationDate: string;
}

// ─── Paystack ─────────────────────────────────────────────────────────────────

export interface PaystackTransactionData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackInitiateTransactionResponse {
  status: boolean;
  message: string;
  data: PaystackTransactionData;
}

// ─── Tax ──────────────────────────────────────────────────────────────────────

/** Single tax line returned by GET /api/v1/tax */
export interface TaxOrderItem {
  id: number;
  taxName: string;
  taxRate: number;
  taxAmount: number;
}

/** Matches backend TaxCalculationResult */
export interface TaxCalculationResult {
  orderTaxes: TaxOrderItem[];
  /** Pre-formatted string, e.g. "GHS 5.00" */
  totalTaxAmount: string;
  /** Pre-formatted string, e.g. "GHS 105.00" */
  totalAmountAfterTax: string;
}

/** Matches backend TaxResponse — returned by admin CRUD endpoints */
export interface TaxResponse {
  id: number;
  name: string;
  code: string;
  rate: number;
  isActive: boolean;
  isCompound: boolean;
  applyOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** POST /api/v1/tax/add-tax  |  PUT /api/v1/tax/update/{taxId} */
export interface TaxRequest {
  name: string;
  code: string;
  rate: number;
  isActive?: boolean;
  isCompound?: boolean;
  applyOrder: number;
}

// ─── Admin Metrics ──────────────────────────────────────────────────────────

export interface CustomerDataResponse {
  id: number;
  fullName: string;
  email: string;
  orderCount: number;
  totalSpent: string;
  isActive: boolean;
  dateJoined: string;
}

export interface MostPurchaseProductResponse {
  productId: number;
  productName: string;
  viewCount: number;
  addToCartCount: number;
  soldCount: number;
  conversionRate: number;
}

export interface CouponMetricResponse {
  totalCreated: number;
  totalUsage: number;
  totalDiscountGiven: string;
  totalRevenueGenerated: string;
  coupons: CouponListResponse[];
}

export interface PageVisitMetric {
  page: string;
  uniqueVisits: number;
}

export interface SiteVisitMetric {
  totalVisits: number;
  totalUniqueVisitors: number;
  totalPageViews: number;
  uniqueVisitToOrderConversionRate: number;
  top5MostVisitedPages: PageVisitMetric[];
}

export interface DailyRevenueMetric {
  date: string;
  revenue: number;
}

export interface OrderCountMetric {
  totalOrders: number;
  totalDeliveredOrders: number;
  totalPendingOrders: number;
  totalCancelledOrders: number;
}

export interface TopCompositionMetric {
  productId: number;
  productName: string;
  productImage: string;
  totalSold: number;
  totalRevenue: number;
}

export interface DashboardMetrics {
  totalRevenue: string;
  orderCountMetric: OrderCountMetric;
  totalCustomers: number;
  totalProducts: number;
  totalSiteVisits: number;
  dailyRevenueMetric: DailyRevenueMetric[];
  top5Compositions: TopCompositionMetric[];
}

export interface TopCustomer {
  fullName: string;
  email: string;
  totalOrders: number;
  totalAmountSpent: number;
}

export interface LowStockProduct {
  id: number;
  stockQuantity: number;
  productName: string;
  productImage: string;
}

// ─── Generic API Wrapper ──────────────────────────────────────────────────────

export interface CustomApiResponse<T> {
  description: string;
  data: T;
}

// ─── Legacy (kept for components not yet migrated) ────────────────────────────

/** @deprecated Use AuthResponse instead */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/** @deprecated Use DeliveryDetailResponse instead */
export interface Address {
  id: string;
  label: AddressLabel;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  addressLine: string;
  isActive?: boolean;
}
