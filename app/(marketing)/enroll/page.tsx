"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { MARKETING_IMAGES } from "@/lib/brand";

export default function EnrollPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: form.get("first_name"),
        last_name: form.get("last_name"),
        birthday: form.get("birthday") || null,
        email: form.get("email") || null,
        phone: form.get("phone"),
        program_interest: form.get("program_interest"),
        parent_name: form.get("parent_name") || null,
        parent_phone: form.get("parent_phone") || null,
        parent_email: form.get("parent_email") || null,
        emergency_contact: form.get("emergency_contact") || null,
        waiver_accepted: form.get("waiver_accepted") === "on",
      }),
    });
    setStatus(res.ok ? "success" : "error");
  }

  if (status === "success") {
    return (
      <>
        <PageBanner title="Thank You!" subtitle="Your enrollment application has been received." imageUrl={MARKETING_IMAGES.hero} />
        <div className="px-4 py-16 text-center sm:px-6">
          <FadeIn>
            <p className="text-lg text-kaizen-silver">We&apos;ll contact you shortly to schedule your first class.</p>
            <p className="mt-4 text-sm text-kaizen-muted">Questions? Message us on WhatsApp or Facebook.</p>
          </FadeIn>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner
        title="Enroll Now"
        subtitle="Start your martial arts journey at Dojo Kaizen 2600"
        imageUrl={MARKETING_IMAGES.programs}
      />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-blue/20 bg-kaizen-dark p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">First Name *</Label>
                <Input id="first_name" name="first_name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input id="last_name" name="last_name" required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="birthday">Birthday</Label>
                <Input id="birthday" name="birthday" type="date" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" type="tel" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="program_interest">Program Interest *</Label>
              <Input id="program_interest" name="program_interest" placeholder="Muay Thai, MMA, Kids..." required />
            </div>
            <hr className="border-blue/20" />
            <p className="text-sm font-semibold text-gold">Parent / Guardian (if minor)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="parent_name">Parent Name</Label>
                <Input id="parent_name" name="parent_name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parent_phone">Parent Phone</Label>
                <Input id="parent_phone" name="parent_phone" type="tel" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input id="emergency_contact" name="emergency_contact" placeholder="Name - Phone" />
            </div>
            <label className="flex items-start gap-3 text-sm text-kaizen-muted">
              <input type="checkbox" name="waiver_accepted" className="mt-1" required />
              I agree to the academy waiver and terms of enrollment.
            </label>
            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Submitting..." : "Submit Enrollment"}
            </Button>
            {status === "error" && <p className="text-sm text-red-400">Submission failed. Please try again.</p>}
          </form>
        </div>
      </div>
    </>
  );
}
