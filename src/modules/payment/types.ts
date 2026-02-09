export interface PaymentResponse {
  id: number;
  amount: number;
  package_title: string | null;
  package_slug: string | null;
  package_price: number | null;
  package_discount: number | null;
  package_is_tiral: boolean;
  is_success: boolean;
  expires_at: string | null;
}

export interface Package {
  id: number;
  title: string;
  slug: string;
  tier: number;
  description: string | null;
  price: number;
  discount_percent: number | null;
  is_trial: boolean | null;
}

export interface PaidPackageResponse {
  paid_packages: Package[];
  largest_tier: number;
}
