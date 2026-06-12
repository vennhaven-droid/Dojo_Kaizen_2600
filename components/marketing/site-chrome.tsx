import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/marketing/brand-logo";
import { BRAND } from "@/lib/brand";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/coaches", label: "Coaches" },
  { href: "/schedule", label: "Schedule" },
  { href: "/pricing", label: "Pricing" },
  { href: "/success", label: "Success" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-blue/30 bg-kaizen-black/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo size={52} priority />
          <div className="hidden sm:block">
            <p className="font-display text-sm font-bold text-gold leading-tight tracking-wide">
              {BRAND.tagline}
            </p>
            <p className="text-xs text-kaizen-silver tracking-widest">DOJO 2600</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-kaizen-gray transition-colors hover:bg-blue/10 hover:text-blue"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
            <Link href="/enroll">Book Trial</Link>
          </Button>
          <Button asChild variant="gold" size="sm">
            <Link href="/enroll">Enroll Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-blue/30 bg-kaizen-dark">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <BrandLogo size={44} />
              <span className="font-display text-sm font-bold text-gold">{BRAND.shortName}</span>
            </div>
            <p className="text-sm text-kaizen-muted leading-relaxed">
              Premium martial arts training in Baguio City. Discipline. Respect. Continuous improvement.
            </p>
            <a
              href={BRAND.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-blue hover:underline"
            >
              Facebook Page →
            </a>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-kaizen-gray mb-3">Programs</h4>
            <ul className="space-y-2 text-sm text-kaizen-muted">
              <li><Link href="/programs" className="hover:text-blue">Muay Thai</Link></li>
              <li><Link href="/programs" className="hover:text-blue">MMA</Link></li>
              <li><Link href="/programs" className="hover:text-blue">Boxing</Link></li>
              <li><Link href="/programs" className="hover:text-blue">Kids Martial Arts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-kaizen-gray mb-3">Academy</h4>
            <ul className="space-y-2 text-sm text-kaizen-muted">
              <li><Link href="/about" className="hover:text-blue">About Us</Link></li>
              <li><Link href="/coaches" className="hover:text-blue">Coaches</Link></li>
              <li><Link href="/schedule" className="hover:text-blue">Schedule</Link></li>
              <li><Link href="/pricing" className="hover:text-blue">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-kaizen-gray mb-3">Visit Us</h4>
            <ul className="space-y-2 text-sm text-kaizen-muted">
              <li>{BRAND.location}</li>
              <li><a href={`tel:${BRAND.phoneTel}`} className="hover:text-gold">{BRAND.phone}</a></li>
              <li>{BRAND.hours}</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-blue/10 pt-8 text-center text-xs text-kaizen-muted">
          &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
