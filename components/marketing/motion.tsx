"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <h2 className="font-display text-3xl font-bold text-kaizen-gray sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-kaizen-muted max-w-2xl mx-auto">{subtitle}</p>}
      <div className={`mt-4 h-1 w-16 bg-gold ${align === "center" ? "mx-auto" : ""}`} />
    </div>
  );
}
