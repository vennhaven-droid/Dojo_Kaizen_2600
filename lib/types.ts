export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "COACH"
  | "PARENT"
  | "STUDENT";

export type MembershipType =
  | "MONTHLY"
  | "WALK_IN"
  | "SESSION_PACKAGE"
  | "PRIVATE_COACHING"
  | "UNLIMITED"
  | "CUSTOM";

export type MembershipStatus =
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRED"
  | "CANCELLED"
  | "TRIAL";

export type PricingType =
  | "REGULAR"
  | "FIGHTER"
  | "COACH"
  | "VIP"
  | "LEGACY"
  | "SCHOLARSHIP"
  | "CUSTOM";

export type PaymentMethod =
  | "CASH"
  | "GCASH"
  | "BANK_TRANSFER"
  | "CARD"
  | "OTHER";

export type LockerStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "EXPIRED";

export type CheckInMethod = "LOGIN" | "QR" | "ADMIN_OVERRIDE";

export type StudentStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface Profile {
  id: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  email: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  profile_id: string | null;
  first_name: string;
  last_name: string;
  nickname: string | null;
  photo_url: string | null;
  birthday: string | null;
  gender: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  medical: Record<string, unknown> | null;
  status: StudentStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Guardian {
  id: string;
  student_id: string;
  name: string;
  relationship: string;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
}

export interface Program {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  age_min: number | null;
  age_max: number | null;
  default_price: number;
  is_active: boolean;
  sort_order: number;
}

export interface Membership {
  id: string;
  student_id: string;
  program_id: string;
  type: MembershipType;
  status: MembershipStatus;
  pricing_type: PricingType;
  custom_rate: number | null;
  due_date: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface SessionPackage {
  id: string;
  membership_id: string;
  purchased: number;
  used: number;
  remaining: number;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  check_in_method: CheckInMethod;
  checked_in_at: string;
  checked_out_at?: string | null;
  duration_minutes?: number | null;
  notes: string | null;
}

export interface Payment {
  id: string;
  student_id: string;
  amount: number;
  method: PaymentMethod;
  reference_number: string | null;
  membership_id: string | null;
  locker_rental_id: string | null;
  payment_type: string;
  notes: string | null;
  paid_at: string;
  due_date?: string | null;
  payment_status?: PaymentRecordStatus;
  amount_due?: number | null;
  amount_paid?: number | null;
}

export interface StudentStats {
  student_id: string;
  total_visits: number;
  monthly_visits: number;
  yearly_visits: number;
  current_streak: number;
  longest_streak: number;
  xp_points: number;
  level: number;
  last_visit: string | null;
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  threshold: number | null;
  category: string;
}

export interface SiteSettings {
  id: string;
  academy_name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  facebook_url: string | null;
  messenger_url: string | null;
  map_embed_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  brand_colors: Record<string, string> | null;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  sections: Record<string, unknown>;
  is_published: boolean;
}

export interface EnrollmentLead {
  id: string;
  first_name: string;
  last_name: string;
  birthday: string | null;
  email: string | null;
  phone: string | null;
  program_interest: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  emergency_contact: string | null;
  waiver_accepted: boolean;
  status: string;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at?: string;
}

export type InquiryStatus = "NEW" | "READ" | "REPLIED" | "CLOSED";

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  source_page: string | null;
  status: InquiryStatus;
  assigned_to: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type PaymentRecordStatus = "PAID" | "UNPAID" | "PARTIAL" | "OVERDUE";

export interface Coach {
  id: string;
  profile_id: string;
  bio: string | null;
  experience: string | null;
  certifications: string[] | null;
  achievements: string[] | null;
  photo_url: string | null;
  is_active: boolean;
}

export interface Competition {
  id: string;
  student_id: string;
  name: string;
  date: string;
  division: string | null;
  weight_class: string | null;
  opponent: string | null;
  result: string | null;
  placement: string | null;
  medal: string | null;
  photos: string[] | null;
  coach_notes: string | null;
}

export interface Locker {
  id: string;
  number: string;
  status: LockerStatus;
  monthly_fee: number;
}

export interface LockerRental {
  id: string;
  locker_id: string;
  student_id: string;
  start_date: string;
  renewal_date: string | null;
  monthly_fee: number;
  status: LockerStatus;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
