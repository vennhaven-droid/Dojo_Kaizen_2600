import { getCmsPricingAdmin, getPricingPageCms } from "@/lib/cms";
import {
  createPricingTierAction,
  updatePricingTierAction,
  deletePricingTierAction,
  resetPricingToDefaultsAction,
  updatePricingCtaAction,
} from "../cms/actions";
import {
  buildPricingPageSections,
  ADMIN_CATEGORY_LABELS,
  DEFAULT_CUSTOM_CTA,
  type PricingCategory,
  type PricingTier,
} from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPeso } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const CATEGORY_OPTIONS = Object.entries(ADMIN_CATEGORY_LABELS).filter(
  ([k]) => k !== "general"
) as [PricingCategory, string][];

function CategorySelect({ name, defaultValue }: { name: string; defaultValue?: string }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? "group_classes"}
      className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm"
    >
      {CATEGORY_OPTIONS.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

function BillingSelect({ name, defaultValue }: { name: string; defaultValue?: string }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? "monthly"}
      className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm"
    >
      <option value="walk-in">Walk-in</option>
      <option value="session">Per session</option>
      <option value="package">Package</option>
      <option value="monthly">Monthly</option>
    </select>
  );
}

function TierEditor({ tier }: { tier: PricingTier }) {
  if (!tier.id) return null;
  return (
    <div className="space-y-2">
      <form
        action={updatePricingTierAction.bind(null, tier.id)}
        className="space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-semibold text-kaizen-silver">{tier.title}</h4>
          {tier.is_promoted && <Badge variant="gold">Promoted</Badge>}
          <Badge variant={tier.is_published ? "success" : "muted"}>
            {tier.is_published ? "Published" : "Draft"}
          </Badge>
          <span className="text-sm text-kaizen-muted">{formatPeso(Number(tier.price))}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Title</Label><Input name="title" defaultValue={tier.title} required /></div>
          <div className="space-y-1.5"><Label>Price (₱)</Label><Input name="price" type="number" step="0.01" defaultValue={Number(tier.price)} required /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <CategorySelect name="category" defaultValue={tier.category ?? "group_classes"} />
          </div>
          <div className="space-y-1.5">
            <Label>Billing period</Label>
            <BillingSelect name="billing_period" defaultValue={tier.billing_period ?? "monthly"} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Sort order</Label><Input name="sort_order" type="number" defaultValue={tier.sort_order ?? 0} /></div>
          <div className="space-y-1.5">
            <Label>Note</Label>
            <Input name="note" defaultValue={tier.note ?? ""} />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_promoted" defaultChecked={tier.is_promoted} />
            Promoted
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_published" defaultChecked={tier.is_published} />
            Published
          </label>
        </div>
        <Button type="submit" variant="outline" size="sm">Save tier</Button>
      </form>
      <form action={deletePricingTierAction.bind(null, tier.id)} className="ml-6">
        <Button type="submit" variant="ghost" size="sm" className="text-red-400">
          Delete tier
        </Button>
      </form>
    </div>
  );
}

export default async function AdminPricingPage() {
  const [tiers, pricingCms] = await Promise.all([getCmsPricingAdmin(), getPricingPageCms()]);
  const sections = buildPricingPageSections(tiers, pricingCms);
  const customCta = sections.customCta;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Pricing</h2>
          <p className="text-sm text-kaizen-muted">
            Rates are grouped on the public page: Group Classes, Private Classes (Single Session &amp; 10-Session Package), and Custom Contact.
          </p>
        </div>
        <form action={resetPricingToDefaultsAction}>
          <Button type="submit" variant="outline" size="sm">
            Reset to default rates
          </Button>
        </form>
      </div>

      <form action={createPricingTierAction} className="max-w-xl space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <h3 className="font-display text-lg text-gold">Add pricing tier</h3>
        <div className="space-y-1.5"><Label>Title</Label><Input name="title" required placeholder="Walk-in" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Price (₱)</Label><Input name="price" type="number" step="0.01" required /></div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <CategorySelect name="category" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Billing period</Label>
            <BillingSelect name="billing_period" />
          </div>
          <div className="space-y-1.5"><Label>Sort order</Label><Input name="sort_order" type="number" defaultValue={0} /></div>
        </div>
        <div className="space-y-1.5">
          <Label>Note (optional — e.g. expiration)</Label>
          <Input name="note" placeholder="Single session — expires 1 month after purchase" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_promoted" />
          Highlight as promoted
        </label>
        <Button type="submit" variant="gold">Add tier</Button>
      </form>

      {/* Category 1: Group Classes */}
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold text-gold">{sections.groupClasses.label}</h3>
        {sections.groupClasses.tiers.map((tier) => (
          <TierEditor key={tier.id ?? tier.title} tier={tier} />
        ))}
      </div>

      {/* Category 2: Private Classes */}
      <div className="space-y-6">
        <h3 className="font-display text-xl font-bold text-gold">{sections.privateClasses.label}</h3>
        {sections.privateClasses.subsections.map((sub) => (
          <div key={sub.category} className="space-y-4 rounded-xl border border-blue/15 bg-kaizen-black/30 p-5">
            <h4 className="font-display text-lg font-semibold text-kaizen-silver">{sub.label}</h4>
            {sub.tiers.map((tier) => (
              <TierEditor key={tier.id ?? `${sub.category}-${tier.title}`} tier={tier} />
            ))}
          </div>
        ))}
      </div>

      {/* Category 4: Custom CTA */}
      <form action={updatePricingCtaAction} className="max-w-xl space-y-4 rounded-xl border border-gold/30 bg-gold/5 p-6">
        <h3 className="font-display text-lg text-gold">Custom Programs (contact section)</h3>
        <p className="text-sm text-kaizen-muted">
          Shown as the fourth block on /pricing with Call and Contact buttons.
        </p>
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input name="cta_title" defaultValue={customCta.title ?? DEFAULT_CUSTOM_CTA.title} required />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            name="cta_description"
            rows={3}
            defaultValue={customCta.description ?? DEFAULT_CUSTOM_CTA.description}
            required
          />
        </div>
        <Button type="submit" variant="gold">Save contact section</Button>
      </form>
    </div>
  );
}
