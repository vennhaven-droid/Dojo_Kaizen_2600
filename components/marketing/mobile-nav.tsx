"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const menu = (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[80] bg-kaizen-black/80 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <nav
        className={cn(
          "fixed right-0 top-0 z-[90] flex h-dvh w-[min(100vw,20rem)] flex-col border-l border-kaizen-red/30 bg-kaizen-black shadow-2xl transition-transform duration-200 ease-out lg:hidden",
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-kaizen-red/20 px-5 py-4">
          <p className="font-display text-sm font-bold tracking-widest text-gold">MENU</p>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-kaizen-muted hover:bg-kaizen-red/10 hover:text-gold"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3.5 text-base font-medium text-kaizen-gray transition-colors hover:bg-kaizen-red/10 hover:text-gold"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="shrink-0 border-t border-kaizen-red/20 px-5 py-4">
          <Button asChild variant="gold" className="w-full" onClick={() => setOpen(false)}>
            <Link href="/enroll">Enroll Now</Link>
          </Button>
        </div>
      </nav>
    </>
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-kaizen-red/30 text-kaizen-gray transition-colors hover:bg-kaizen-red/10 hover:text-gold"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? (
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          ) : (
            <>
              <path strokeLinecap="round" d="M4 7h16" />
              <path strokeLinecap="round" d="M4 12h16" />
              <path strokeLinecap="round" d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {mounted && createPortal(menu, document.body)}
    </div>
  );
}
