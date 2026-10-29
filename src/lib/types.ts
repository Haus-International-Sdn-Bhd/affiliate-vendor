export type SettlementClass =
  | 'pilihan_a'
  | 'pilihan_b'
  | 'pilihan_c'
  | 'kelas_a'
  | 'kelas_b'
  | 'kelas_c'
  | 'kelas_d'
  | 'kelas_e'
  | 'kelas_f'
  | string;

export interface Brand {
  id: string;
  name: string;
  company_name?: string;
  slug: string;
  code?: string;
  is_anchor?: boolean;
  registration_no?: string;
  ssm_registration_no?: string;
  vendor_name?: string;
  display_label?: string;
  logo_url?: string;
  description?: string;
  settlement_class?: SettlementClass;
  current_class?: SettlementClass;
  settlement_model?: 'fixed' | 'prorata';
  custom_platform_fee_percent?: number;
  safety_deduction_cap_percent?: number;
  prorate_platform_vouchers?: boolean;
  commission_class?: string;
  brand_share_percentage?: number;
  bonus_fund_percentage?: number;
  affiliate_pool_percentage?: number;
  platform_fee_percentage?: number;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  bank_name?: string;
  bank_account_no?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  bank_account_holder?: string;
  bank_swift_code?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface DashboardStats {
  gross_sales: number;
  total_items_sold: number;
  settled_ncs: number;
  estimated_brand_payout: number;
  estimated_bonus_fund: number;
  estimated_platform_fee: number;
  order_count: number;
}

export interface DashboardData {
  brand: Brand;
  active_class: {
    code: SettlementClass;
    name: string;
    brand_share_pct: number;
    bonus_fund_pct: number;
    platform_fee_pct: number;
    is_recommended: boolean;
  };
  stats: DashboardStats;
  current_cycle: {
    cycle_name: string;
    start_date: string;
    end_date: string;
    payout_date: string;
    days_until_cutoff: number;
    status: string;
  };
  pending_class_change: ClassChangeRequest | null;
}

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  stock: number;
  description?: string;
  short_description?: string;
  featured_image?: string;
  gallery_images?: string[];
  status: 'active' | 'draft' | 'inactive';
  has_variants?: boolean;
  variants?: ProductVariant[];
  created_at?: string;
}

export interface ProductVariant {
  id?: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
}

export interface ProductPerformanceItem {
  id: number | string;
  uuid: string;
  name: string;
  sku?: string;
  category?: string;
  stock_quantity: number;
  is_active: boolean;
  retail_price: number;
  units_sold: number;
  gross_revenue: number;
  discounts: number;
  vouchers: number;
  refunds: number;
  ncs_contribution: number;
  brand_payout: number;
}

export interface ReportingData {
  summary: {
    gross_merchandise_value: number;
    total_discounts: number;
    eligible_vouchers: number;
    refunds: number;
    settled_ncs: number;
    brand_net_payout: number;
    bonus_fund_pool: number;
    platform_fee: number;
    order_count?: number;
    items_sold?: number;
  };
  breakdown: Array<{
    date: string;
    gross_sales?: number;
    gross_revenue?: number;
    settled_ncs: number;
    brand_payout: number;
    items_sold?: number;
    units_sold?: number;
    orders_count?: number;
  }>;
  top_products: Array<{
    id: string | number;
    name: string;
    sku: string;
    units_sold: number;
    gross_revenue: number;
    ncs_contribution: number;
    brand_payout?: number;
  }>;
  products?: ProductPerformanceItem[];
}


export interface SettlementStatement {
  id: string;
  statement_number: string;
  cycle_name: string;
  cycle_start_date: string;
  cycle_end_date: string;
  payout_date: string;
  settlement_class: SettlementClass;
  brand_share_percentage: number;
  gross_merchandise_value: number;
  total_discounts: number;
  eligible_vouchers: number;
  refunds_deductions: number;
  settled_ncs: number;
  brand_net_payout: number;
  bonus_fund_amount: number;
  platform_fee_amount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'paid';
  paid_at?: string;
  payment_reference?: string;
  created_at: string;
}

export interface ClassChangeRequest {
  id: string;
  requested_class: SettlementClass;
  requested_class_name: string;
  current_class: SettlementClass;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  effective_cycle_date?: string;
  admin_notes?: string;
  created_at: string;
}

export interface CashbackRule {
  id: string | number;
  brand_id?: string | number;
  name: string;
  description?: string;
  cashback_percent: number;
  product_scope: 'all' | 'price_range' | 'selected_products';
  min_price?: number;
  max_price?: number;
  selected_product_ids?: (string | number)[];
  audience_scope: 'everyone' | 'selected_ranks' | 'selected_users';
  selected_ranks?: string[];
  selected_user_ids?: (string | number)[];
  priority: number;
  start_at?: string;
  end_at?: string;
  is_active: boolean;
  status: 'pending_approval' | 'approved' | 'rejected';
  created_by_role: 'admin' | 'vendor';
  created_at?: string;
}
