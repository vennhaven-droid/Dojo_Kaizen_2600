export type PricingCategory = "group_classes" | "private_single" | "private_package" | "general";

export type PricingTier = {
  id?: string;
  title: string;
  description?: string | null;
  price: number;
  billing_period?: string | null;
  category?: string | null;
  note?: string | null;
  features?: string[] | unknown;
  is_promoted?: boolean;
  sort_order?: number;
  is_published?: boolean;
};

export type PricingCustomCta = {
  title: string;
  description: string;
};

export const DEFAULT_CUSTOM_CTA: PricingCustomCta = {
  title: "Custom Programs",
  description: "Need a tailored plan? Call or contact us for customized training packages.",
};

export const PRICING_CATEGORY_ORDER: PricingCategory[] = [
  "group_classes",
  "private_single",
  "private_package",
];

/** Public section headers */
export const PRICING_SECTION_LABELS = {
  groupClasses: "GROUP CLASSES",
  privateClasses: "PRIVATE CLASSES",
  privateSingle: "Single Session",
  privatePackage: "10-Session Package",
} as const;

/** Admin dropdown labels */
export const ADMIN_CATEGORY_LABELS: Record<PricingCategory, string> = {
  group_classes: "Group Classes",
  private_single: "Private — Single Session",
  private_package: "Private — 10-Session Package",
  general: "Other",
};

/** @deprecated Use buildPricingPageSections for public display */
export const PRICING_CATEGORY_LABELS: Record<PricingCategory, string> = {
  group_classes: PRICING_SECTION_LABELS.groupClasses,
  private_single: PRICING_SECTION_LABELS.privateSingle,
  private_package: PRICING_SECTION_LABELS.privatePackage,
  general: "OTHER",
};

const CATEGORY_SORT: Record<string, number> = {
  group_classes: 0,
  private_single: 1,
  private_package: 2,
  general: 99,
};

function sortTiers(tiers: PricingTier[]) {
  return [...tiers].sort((a, b) => {
    const catA = CATEGORY_SORT[a.category ?? "general"] ?? 99;
    const catB = CATEGORY_SORT[b.category ?? "general"] ?? 99;
    if (catA !== catB) return catA - catB;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
}

function tiersForCategory(tiers: PricingTier[], category: PricingCategory) {
  return sortTiers(tiers).filter((t) => (t.category ?? "general") === category);
}

export function formatBillingLabel(period?: string | null): string {
  switch (period) {
    case "walk-in":
      return "walk-in";
    case "session":
      return "per session";
    case "package":
      return "package";
    case "monthly":
      return "monthly";
    default:
      return period ?? "";
  }
}

export function buildPricingPageSections(
  tiers: PricingTier[],
  customCta?: Partial<PricingCustomCta>
) {
  const singleTiers = tiersForCategory(tiers, "private_single");
  const packageTiers = tiersForCategory(tiers, "private_package");

  return {
    groupClasses: {
      label: PRICING_SECTION_LABELS.groupClasses,
      tiers: tiersForCategory(tiers, "group_classes"),
    },
    privateClasses: {
      label: PRICING_SECTION_LABELS.privateClasses,
      subsections: [
        {
          category: "private_single" as const,
          label: PRICING_SECTION_LABELS.privateSingle,
          note:
            singleTiers.find((t) => t.note)?.note ??
            "Single session — expires 1 month after purchase",
          tiers: singleTiers,
        },
        {
          category: "private_package" as const,
          label: PRICING_SECTION_LABELS.privatePackage,
          note: packageTiers.find((t) => t.note)?.note ?? null,
          tiers: packageTiers,
        },
      ],
    },
    customCta: {
      ...DEFAULT_CUSTOM_CTA,
      ...customCta,
    },
  };
}

export function groupPricingTiers(tiers: PricingTier[]) {
  const sorted = sortTiers(tiers);
  const groups: { category: PricingCategory; label: string; note: string | null; tiers: PricingTier[] }[] = [];

  for (const cat of PRICING_CATEGORY_ORDER) {
    const catTiers = sorted.filter((t) => (t.category ?? "general") === cat);
    if (catTiers.length === 0) continue;
    const note = catTiers.find((t) => t.note)?.note ?? null;
    groups.push({
      category: cat,
      label: ADMIN_CATEGORY_LABELS[cat],
      note,
      tiers: catTiers,
    });
  }

  const uncategorized = sorted.filter(
    (t) => !PRICING_CATEGORY_ORDER.includes((t.category ?? "general") as PricingCategory)
  );
  if (uncategorized.length > 0) {
    groups.push({
      category: "general",
      label: "OTHER",
      note: null,
      tiers: uncategorized,
    });
  }

  return groups;
}

export const DEFAULT_PRICING_TIERS: PricingTier[] = [
  { title: "Walk-in", price: 300, billing_period: "walk-in", category: "group_classes", sort_order: 1, is_promoted: false, is_published: true },
  { title: "Student Walk-in", price: 250, billing_period: "walk-in", category: "group_classes", sort_order: 2, is_promoted: false, is_published: true },
  { title: "Monthly / 12 Sessions", price: 2500, billing_period: "package", category: "group_classes", sort_order: 3, is_promoted: false, is_published: true },
  { title: "Unlimited Monthly", price: 3500, billing_period: "monthly", category: "group_classes", sort_order: 4, is_promoted: true, is_published: true },
  { title: "1 Pax", price: 500, billing_period: "session", category: "private_single", note: "Single session — expires 1 month after purchase", sort_order: 1, is_promoted: false, is_published: true },
  { title: "2 Pax", price: 700, billing_period: "session", category: "private_single", sort_order: 2, is_promoted: false, is_published: true },
  { title: "3 Pax", price: 900, billing_period: "session", category: "private_single", sort_order: 3, is_promoted: false, is_published: true },
  { title: "4 Pax", price: 1100, billing_period: "session", category: "private_single", sort_order: 4, is_promoted: false, is_published: true },
  { title: "1 Pax", price: 4000, billing_period: "package", category: "private_package", sort_order: 1, is_promoted: false, is_published: true },
  { title: "2 Pax", price: 4500, billing_period: "package", category: "private_package", sort_order: 2, is_promoted: false, is_published: true },
  { title: "3 Pax", price: 5000, billing_period: "package", category: "private_package", sort_order: 3, is_promoted: false, is_published: true },
  { title: "4 Pax", price: 5500, billing_period: "package", category: "private_package", sort_order: 4, is_promoted: false, is_published: true },
];
