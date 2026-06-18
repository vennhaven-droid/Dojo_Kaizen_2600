"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/marketing/motion";
import { WEEKLY_SCHEDULE_BLOCKS, FLYER_PROGRAMS } from "@/lib/brand";

const blockIcons: Record<string, string> = {
  morning: "☀️",
  kids: "🥋",
  afternoon: "🥊",
  evening: "🌙",
};

export function ScheduleBoard() {
  return (
    <div className="space-y-16">
      <FadeIn>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FLYER_PROGRAMS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-xl border border-blue/30 bg-kaizen-dark p-5 text-center transition-transform hover:-translate-y-1 hover:border-gold/40"
            >
              <h3 className="font-display text-lg font-bold text-gold">{p.name}</h3>
              <p className="mt-2 text-xs text-kaizen-muted">{p.tagline}</p>
            </motion.div>
          ))}
        </div>
      </FadeIn>

      <div className="space-y-10">
        {WEEKLY_SCHEDULE_BLOCKS.map((block, blockIndex) => (
          <FadeIn key={block.id} delay={blockIndex * 0.05}>
            <section className={`overflow-hidden rounded-2xl border ${block.accent}`}>
              <div className="border-b border-white/5 bg-kaizen-black/60 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>{blockIcons[block.id]}</span>
                  <div>
                    <h2 className="font-display text-xl font-bold text-kaizen-gray sm:text-2xl">{block.title}</h2>
                    <p className="mt-1 text-sm text-kaizen-muted">{block.subtitle}</p>
                  </div>
                </div>
              </div>
              <ul className="divide-y divide-white/5">
                {block.entries.map((entry, i) => (
                  <motion.li
                    key={`${entry.time}-${entry.className}-${i}`}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className="group grid gap-3 px-6 py-5 transition-colors hover:bg-white/[0.02] sm:grid-cols-[7rem_1fr_auto] sm:items-center sm:gap-6 sm:px-8"
                  >
                    <span className="font-display text-lg font-bold text-gold">{entry.time}</span>
                    <div>
                      <p className="font-display font-bold text-kaizen-gray group-hover:text-gold transition-colors">
                        {entry.className}
                      </p>
                      <p className="mt-1 text-sm text-kaizen-muted">{entry.coach}</p>
                    </div>
                    <span className="inline-flex w-fit rounded-full border border-blue/30 bg-blue/10 px-3 py-1 text-xs font-semibold text-blue">
                      {entry.days}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </section>
          </FadeIn>
        ))}
      </div>

      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl border border-kaizen-red/40 bg-gradient-to-br from-kaizen-red/15 via-kaizen-black to-blue/10 p-8 text-center sm:p-12">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_8px,rgba(229,57,53,0.03)_8px,rgba(229,57,53,0.03)_16px)]" />
          <div className="relative">
            <p className="font-display text-sm font-bold tracking-[0.25em] text-gold">BEGINNER-FRIENDLY</p>
            <h3 className="mt-3 font-display text-2xl font-bold text-kaizen-gray sm:text-3xl text-distressed">
              NO EXPERIENCE NEEDED
            </h3>
            <p className="mx-auto mt-4 max-w-lg text-kaizen-silver">
              Message us now — limited slots per class. Start your martial arts journey at Dojo Kaizen 2600.
            </p>
            <Button asChild variant="gold" size="lg" className="mt-8">
              <Link href="/enroll">Enroll Now</Link>
            </Button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
