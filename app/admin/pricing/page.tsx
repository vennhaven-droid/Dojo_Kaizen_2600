import { getCmsPricing } from "@/lib/cms";
import { createPricingTierAction, updatePricingTierAction } from "../cms/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPeso } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminPricingPage() {
  const tiers = await getCmsPricing();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold">Pricing</h2>
        <p className="text-sm text-kaizen-muted">These tiers appear on the public /pricing page.</p>
      </div>

      <form action={createPricingTierAction} className="max-w-xl space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <h3 className="font-display text-lg text-gold">Add pricing tier</h3>
        <div className="space-y-1.5"><Label>Title</Label><Input name="title" required placeholder="Monthly Unlimited" /></div>
        <div className="space-y-1.5"><Label>Description</Label><Textarea name="description" rows={2} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Price (₱)</Label><Input name="price" type="number" step="0.01" required /></div>
          <div className="space-y-1.5">
            <Label>Billing period</Label>
            <select name="billing_period" className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm">
              <option value="monthly">Monthly</option>
              <option value="session">Per session</option>
              <option value="package">Session package</option>
              <option value="walk-in">Walk-in</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Features (one per line)</Label>
          <Textarea name="features" rows={4} placeholder="Unlimited classes&#10;Open gym access" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Sort order</Label><Input name="sort_order" type="number" defaultValue={0} /></div>
          <label className="flex items-center gap-2 pt-8 text-sm">
            <input type="checkbox" name="is_promoted" />
            Highlight as promoted
          </label>
        </div>
        <Button type="submit" variant="gold">Add tier</Button>
      </form>

      <div className="space-y-6">
        {tiers.map((tier) => {
          const features = Array.isArray(tier.features) ? tier.features : [];
          return (
            <form
              key={tier.id}
              action={updatePricingTierAction.bind(null, tier.id)}
              className="space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-bold text-gold">{tier.title}</h3>
                {tier.is_promoted && <Badge variant="gold">Promoted</Badge>}
                <Badge variant={tier.is_published ? "success" : "muted"}>
                  {tier.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Title</Label><Input name="title" defaultValue={tier.title} required /></div>
                <div className="space-y-1.5"><Label>Price</Label><Input name="price" type="number" step="0.01" defaultValue={Number(tier.price)} required /></div>
              </div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea name="description" defaultValue={tier.description ?? ""} rows={2} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Billing period</Label>
                  <select name="billing_period" defaultValue={tier.billing_period ?? "monthly"} className="flex h-11 w-full rounded-md border border-blue/20 bg-kaizen-black px-3 text-sm">
                    <option value="monthly">Monthly</option>
                    <option value="session">Per session</option>
                    <option value="package">Session package</option>
                    <option value="walk-in">Walk-in</option>
                  </select>
                </div>
                <div className="space-y-1.5"><Label>Sort order</Label><Input name="sort_order" type="number" defaultValue={tier.sort_order ?? 0} /></div>
              </div>
              <div className="space-y-1.5">
                <Label>Features</Label>
                <Textarea name="features" rows={3} defaultValue={features.join("\n")} />
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
              <p className="text-sm text-kaizen-muted">{formatPeso(Number(tier.price))} / {tier.billing_period}</p>
              <Button type="submit" variant="outline" size="sm">Save tier</Button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
