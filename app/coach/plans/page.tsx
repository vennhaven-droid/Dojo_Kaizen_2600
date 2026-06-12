import { createSessionPlan } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CoachPlansPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="font-display text-2xl font-bold">Session Planner</h2>
      <form action={createSessionPlan} className="space-y-4 rounded-xl border border-blue/20 bg-kaizen-dark p-6">
        <div className="space-y-1.5"><Label>Topic</Label><Input name="topic" required /></div>
        <div className="space-y-1.5"><Label>Techniques</Label><Textarea name="techniques" /></div>
        <div className="space-y-1.5"><Label>Conditioning</Label><Textarea name="conditioning" /></div>
        <div className="space-y-1.5"><Label>Sparring</Label><Textarea name="sparring" /></div>
        <div className="space-y-1.5"><Label>Notes</Label><Textarea name="notes" /></div>
        <Button type="submit" variant="gold">Save Plan</Button>
      </form>
    </div>
  );
}
