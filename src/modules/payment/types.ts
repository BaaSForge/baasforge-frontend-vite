export interface PaymentResponse {
  id: string;
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
  id: string;
  title: string;
  slug: string;
  tier: number;
  description: string | null;
  price: number;
  discount_percent: number | null;
  is_trial: boolean | null;
}

export interface PaymentWithPackage {
  payment: PaymentResponse;
  package: Package;
}

export interface PaidPackageResponse {
  payments: PaymentWithPackage[];
  largest_tier: number;
  can_purchase_trial: boolean;
}

export interface PurchaseResponse {
  package_id: string;
  expires_at: string;
}
