/**
 * Dojo Kaizen brand tokens
 * @see https://www.facebook.com/profile.php?id=100084453027782
 */

export const BRAND = {
  name: "Dojo Kaizen Martial Arts 2600",
  shortName: "Dojo Kaizen 2600",
  tagline: "Kaizen Martial Arts",
  domain: "dojokaizen2600.com",
  location: "Top Floor Palangdao Bldg., Lower General Luna, Baguio City 2600, Philippines",
  phone: "0967 584 2594",
  phoneTel: "+639675842594",
  whatsapp: "https://wa.me/639675842594",
  facebook: "https://www.facebook.com/profile.php?id=100084453027782",
  hours: "Mon–Sun: 5:00 AM – 10:00 PM",
  email: "info@dojokaizen2600.com",
  /** Google Maps search query for the dojo location */
  mapsQuery: "Palangdao Building Lower General Luna Baguio City",
} as const;

export const LOGO_SRC = "/icon.svg";

/** Local marketing photos (replace with your own Facebook photos anytime) */
export const MARKETING_IMAGES = {
  hero: "/images/hero.jpg",
  about: "/images/about.jpg",
  programs: "/images/programs.jpg",
  coaches: "/images/coaches.jpg",
  facility: "/images/facility.jpg",
  gallery: [
    "/images/gallery/1.jpg",
    "/images/gallery/2.jpg",
    "/images/gallery/3.jpg",
    "/images/gallery/4.jpg",
  ],
} as const;

export const BRAND_COLORS = {
  blue: "#0D74D1",
  blueBright: "#1E8FE8",
  gold: "#F2C94C",
  goldBright: "#F1C40F",
  red: "#E53935",
  black: "#0B0B0B",
  silver: "#B8BEC6",
  gray: "#F4F4F4",
  grayDark: "#1A1A1A",
} as const;

/** Fallback weekly schedule when DB has no rows yet */
export const FALLBACK_SCHEDULE = [
  { day: 1, program: "Muay Thai", start: "06:00", end: "07:30", ageGroup: "Adults" },
  { day: 1, program: "Boxing", start: "17:00", end: "18:30", ageGroup: "Adults" },
  { day: 1, program: "MMA", start: "19:00", end: "20:30", ageGroup: "Adults" },
  { day: 2, program: "Fitness Conditioning", start: "06:00", end: "07:00", ageGroup: "Adults" },
  { day: 2, program: "Muay Thai", start: "18:00", end: "19:30", ageGroup: "Adults" },
  { day: 3, program: "Muay Thai", start: "06:00", end: "07:30", ageGroup: "Adults" },
  { day: 3, program: "Kids Martial Arts", start: "16:00", end: "17:00", ageGroup: "Ages 5–12" },
  { day: 3, program: "Boxing", start: "17:00", end: "18:30", ageGroup: "Adults" },
  { day: 4, program: "MMA", start: "18:00", end: "19:30", ageGroup: "Adults" },
  { day: 4, program: "Muay Thai", start: "19:00", end: "20:30", ageGroup: "Adults" },
  { day: 5, program: "Muay Thai", start: "06:00", end: "07:30", ageGroup: "Adults" },
  { day: 5, program: "Open Mat", start: "18:00", end: "20:00", ageGroup: "All levels" },
  { day: 6, program: "Kids Martial Arts", start: "09:00", end: "10:30", ageGroup: "Ages 5–12" },
  { day: 6, program: "Muay Thai", start: "10:30", end: "12:00", ageGroup: "Adults" },
  { day: 0, program: "Open Mat", start: "08:00", end: "10:00", ageGroup: "All levels" },
] as const;

/** Fallback pricing when CMS is empty */
export const FALLBACK_PRICING = [
  {
    title: "Muay Thai Monthly",
    description: "Unlimited Muay Thai group classes",
    price: 2500,
    billing_period: "monthly",
    features: ["Unlimited group classes", "Open mat access", "Progress tracking"],
    is_promoted: true,
  },
  {
    title: "MMA Monthly",
    description: "Unlimited MMA group classes",
    price: 3500,
    billing_period: "monthly",
    features: ["Unlimited MMA classes", "Sparring sessions", "Strength & conditioning"],
    is_promoted: false,
  },
  {
    title: "Kids Martial Arts",
    description: "Monthly membership for ages 5–12",
    price: 2000,
    billing_period: "monthly",
    features: ["2–3 classes per week", "Belt progression", "Safe, fun environment"],
    is_promoted: false,
  },
  {
    title: "Walk-In / Drop-In",
    description: "Single class — no commitment",
    price: 300,
    billing_period: "session",
    features: ["One group class", "Great for visitors", "Pay at the front desk"],
    is_promoted: false,
  },
  {
    title: "Session Package (12)",
    description: "12 sessions — use at your pace",
    price: 2800,
    billing_period: "package",
    features: ["12 class sessions", "3-month validity", "All group classes"],
    is_promoted: false,
  },
  {
    title: "Private Coaching",
    description: "One-on-one with a coach",
    price: 1500,
    billing_period: "session",
    features: ["60-minute session", "Personalized curriculum", "Flexible scheduling"],
    is_promoted: false,
  },
] as const;
