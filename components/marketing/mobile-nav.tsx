"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-blue/30 text-kaizen-gray transition-colors hover:bg-blue/10 hover:text-blue"
      >
        <span className="sr-only">Menu</span>
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

      <div
        className={cn(
          "fixed inset-0 z-40 bg-kaizen-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <nav
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-[min(100%,20rem)] flex-col border-l border-blue/30 bg-kaizen-black/98 p-5 shadow-2xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="font-display text-sm font-bold tracking-widest text-gold">MENU</p>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-kaizen-muted hover:bg-blue/10 hover:text-blue"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <ul className="flex-1 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base font-medium text-kaizen-gray transition-colors hover:bg-blue/10 hover:text-blue"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2 border-t border-blue/20 pt-4">
          <Button asChild variant="secondary" className="w-full" onClick={() => setOpen(false)}>
            <Link href="/enroll">Book Trial</Link>
          </Button>
          <Button asChild variant="gold" className="w-full" onClick={() => setOpen(false)}>
            <Link href="/enroll">Enroll Now</Link>
          </Button>
        </div>
      </nav>
    </div>
  );
}
