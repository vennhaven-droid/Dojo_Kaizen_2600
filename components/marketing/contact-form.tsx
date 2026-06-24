"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn } from "@/components/marketing/motion";
import { PageBanner } from "@/components/marketing/hero-section";
import { SocialLinks } from "@/components/marketing/social-links";
import { BRAND } from "@/lib/brand";

const MAPS_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(BRAND.mapsEmbedQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

export function ContactForm({ bannerUrl }: { bannerUrl: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        message: form.get("message"),
      }),
    });
    setStatus(res.ok ? "success" : "error");
  }

  return (
    <>
      <PageBanner title="Contact Us" subtitle="We'd love to hear from you" imageUrl={bannerUrl} />
      <div className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <FadeIn>
              <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl ring-2 ring-kaizen-red/30 lg:mb-6">
                <iframe
                  title="Dojo Kaizen location map"
                  src={MAPS_EMBED}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-bold text-gold">Location</h3>
                  <p className="mt-2 text-kaizen-silver">{BRAND.location}</p>
                  <a
                    href={BRAND.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-blue hover:underline"
                  >
                    Open in Google Maps →
                  </a>
                </div>
                <div>
                  <h3 className="font-display font-bold text-gold">Phone</h3>
                  <p className="mt-2">
                    <a href={`tel:${BRAND.phoneTel}`} className="text-kaizen-silver hover:text-gold">{BRAND.phone}</a>
                  </p>
                </div>
                <div>
                  <h3 className="font-display font-bold text-gold">Hours</h3>
                  <p className="mt-2 text-kaizen-silver">{BRAND.hours}</p>
                </div>
                <div>
                  <h3 className="font-display font-bold text-gold">Follow Us</h3>
                  <SocialLinks className="mt-3" />
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-blue/30 bg-kaizen-dark p-6">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" required rows={5} />
                </div>
                <Button type="submit" variant="gold" disabled={status === "loading"}>
                  {status === "loading" ? "Sending..." : "Send Message"}
                </Button>
                {status === "success" && <p className="text-sm text-green-400">Message sent!</p>}
                {status === "error" && <p className="text-sm text-red-400">Failed to send. Try again or message us on social media.</p>}
              </form>
            </FadeIn>
          </div>
        </div>
      </div>
    </>
  );
}
