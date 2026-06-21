import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/marketing/brand-logo";
import { MobileNav } from "@/components/marketing/mobile-nav";
import { SocialLinks } from "@/components/marketing/social-links";
import { BRAND } from "@/lib/brand";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/coaches", label: "Coaches" },
  { href: "/schedule", label: "Schedule" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-kaizen-red/20 bg-kaizen-black/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <BrandLogo size={52} priority />
          <div className="hidden sm:block">
            <p className="font-hero text-sm font-bold text-gold leading-tight tracking-wide">
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
              className="rounded-md px-3 py-2 text-sm font-medium text-kaizen-gray transition-colors hover:bg-kaizen-red/10 hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex shadow-md shadow-gold/10">
            <Link href="/enroll">Enroll Now</Link>
          </Button>
          <MobileNav items={NAV} />
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-kaizen-red/20 bg-kaizen-dark">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <BrandLogo size={44} />
              <span className="font-hero text-sm font-bold text-gold">{BRAND.shortName}</span>
            </div>
            <p className="text-sm text-kaizen-muted leading-relaxed">
              Hard-hitting martial arts training in Baguio City. Muay Thai, Boxing, MMA & BJJ.
            </p>
            <SocialLinks className="mt-6" />
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-kaizen-gray mb-3">Programs</h4>
            <ul className="space-y-2 text-sm text-kaizen-muted">
              <li><Link href="/programs" className="hover:text-gold transition-colors">Muay Thai</Link></li>
              <li><Link href="/programs" className="hover:text-gold transition-colors">Boxing</Link></li>
              <li><Link href="/programs" className="hover:text-gold transition-colors">MMA</Link></li>
              <li><Link href="/programs" className="hover:text-gold transition-colors">Brazilian Jiu-Jitsu</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-bold text-kaizen-gray mb-3">Visit Us</h4>
            <ul className="space-y-2 text-sm text-kaizen-muted">
              <li>{BRAND.location}</li>
              <li><a href={`tel:${BRAND.phoneTel}`} className="hover:text-gold transition-colors">{BRAND.phone}</a></li>
              <li>{BRAND.hours}</li>
              <li>
                <a href={BRAND.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue transition-colors">
                  Get Directions
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-t border-blue/10 pt-8 text-xs text-kaizen-muted">
          {BRAND.coreValues.map((v) => (
            <span key={v} className="font-display tracking-wider text-kaizen-silver">{v}</span>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-kaizen-muted">
          &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
