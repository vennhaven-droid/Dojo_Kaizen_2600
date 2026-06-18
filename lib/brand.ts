/**
 * Dojo Kaizen brand tokens
 * @see https://www.facebook.com/profile.php?id=100084453027782
 */

export const BRAND = {
  name: "Dojo Kaizen Martial Arts 2600",
  shortName: "Dojo Kaizen 2600",
  tagline: "Kaizen Martial Arts",
  domain: "dojokaizen2600.com",
  location: "Lower General Luna, Baguio City, Philippines, 2600",
  phone: "0967 584 2594",
  phoneTel: "+639675842594",
  facebook: "https://www.facebook.com/profile.php?id=100084453027782",
  instagram: "https://www.instagram.com/thedojokaizen_",
  mapsUrl: "https://maps.app.goo.gl/qfmwb3XPXUFcwR3s8",
  mapsEmbedQuery: "Dojo Kaizen Palangdao Building Lower General Luna Baguio City",
  hours: "Mon–Sun: 5:00 AM – 10:00 PM",
  email: "info@dojokaizen2600.com",
  coreValues: ["Discipline", "Respect", "Improve Everyday", "Become Your Best"],
} as const;

export const LOGO_SRC = "/images/Home/logo.jpg";

export const MARKETING_IMAGES = {
  hero: "/images/Home/hero.jpg",
  kaizenWay: "/images/Home/logo.jpg",
  about: "/images/Home/logo.jpg",
  programs: "/images/Home/hero.jpg",
  coaches: "/images/Home/hero.jpg",
  facility: "/images/Home/hero.jpg",
  coachPlaceholder: "/images/Home/hero.jpg",
  gallery: [
    "/images/Home/Posts/posts1.jpg",
    "/images/Home/Posts/posts2.jpg",
    "/images/Home/Posts/posts3.jpg",
    "/images/Home/Posts/posts4.jpg",
    "/images/Home/Posts/posts5.jpg",
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

export type ScheduleBlockId = "morning" | "kids" | "afternoon" | "evening";

export type ScheduleEntry = {
  time: string;
  className: string;
  coach: string;
  days: string;
};

export type ScheduleBlock = {
  id: ScheduleBlockId;
  title: string;
  subtitle: string;
  accent: string;
  entries: ScheduleEntry[];
};

export const WEEKLY_SCHEDULE_BLOCKS: ScheduleBlock[] = [
  {
    id: "morning",
    title: "Morning Classes",
    subtitle: "Start strong — fundamentals every day",
    accent: "border-blue/50 bg-blue/5",
    entries: [
      { time: "8:30 AM", className: "Kaizen Fundamentals", coach: "Coach Glenn", days: "MWF + Sun" },
      { time: "9:30 AM", className: "Kaizen Fundamentals", coach: "Coach Brindle / Glenn", days: "Everyday" },
      { time: "9:30 AM", className: "Kaizen Kids: Little Warriors", coach: "Coach Kenneth Banasan", days: "MWF" },
      { time: "10:30 AM", className: "Kaizen Fundamentals", coach: "Coach Brindle / Glenn", days: "Everyday" },
    ],
  },
  {
    id: "kids",
    title: "Kids & Teens",
    subtitle: "Building confidence and discipline early",
    accent: "border-green-500/40 bg-green-500/5",
    entries: [
      { time: "1:00 PM", className: "Kaizen Kids: Little Warriors", coach: "Coach Janel", days: "MWF" },
      { time: "3:30 PM", className: "Next Gen Fighters", coach: "Coach Brindle", days: "TTHS" },
      { time: "4:15 PM", className: "Kaizen Jiu-Jitsu (Kids)", coach: "Coach Marshall Caw-is", days: "MWF" },
    ],
  },
  {
    id: "afternoon",
    title: "Afternoon / Adult",
    subtitle: "Striking mastery and grappling fundamentals",
    accent: "border-orange-500/40 bg-orange-500/5",
    entries: [
      { time: "2:00 PM", className: "Striking Mastery", coach: "Coach Ilidio Saysayan", days: "TTH" },
      { time: "2:00 PM", className: "Kaizen Jiu-Jitsu", coach: "Coach Marshall Caw-is", days: "MWF" },
    ],
  },
  {
    id: "evening",
    title: "Evening Classes",
    subtitle: "Fight team training and advanced programs",
    accent: "border-purple-500/40 bg-purple-500/5",
    entries: [
      { time: "5:30 PM", className: "HULK MMA", coach: "Coach Delfin Nawen", days: "MWF" },
      { time: "5:30 PM", className: "White Belt Program (BJJ)", coach: "Coach Ritchie / Leslie", days: "Fri & Sun" },
      { time: "5:30 PM", className: "Kaizen Elite Fight Team", coach: "Coach Daryl Antero / Brindle", days: "TTHS" },
    ],
  },
];

export const FLYER_PROGRAMS = [
  { name: "Muay Thai", tagline: "Power · Discipline · Confidence" },
  { name: "Boxing", tagline: "Speed · Footwork · Endurance" },
  { name: "MMA", tagline: "Striking · Grappling · Conditioning" },
  { name: "Brazilian Jiu-Jitsu", tagline: "Technique · Control · Submissions" },
] as const;

export const MARKETING_PROGRAMS = [
  { name: "Muay Thai", tagline: "Traditional Thai boxing with modern training methods." },
  { name: "MMA", tagline: "Mixed martial arts combining striking and grappling." },
  { name: "Boxing", tagline: "Classic boxing fundamentals and competition prep." },
  { name: "Kids Martial Arts", tagline: "Fun, safe martial arts for children ages 5–12." },
  { name: "Teen Martial Arts", tagline: "Dynamic training for teens ages 13–17." },
  { name: "Self Defense", tagline: "Practical self-defense for all skill levels." },
  { name: "Fitness Conditioning", tagline: "High-intensity conditioning for fighters and athletes." },
  { name: "Private Coaching", tagline: "One-on-one coaching tailored to your goals." },
] as const;

export const COACHES_TEAM = [
  { name: "Brindle", role: "Head Coach", bio: "Head coach — fundamentals, fight team, and academy leadership." },
  { name: "Daryll", role: "Coach", bio: "Striking and pad work specialist." },
  { name: "Glenn", role: "Coach", bio: "Muay Thai technique and conditioning." },
  { name: "Kenneth", role: "Coach", bio: "MMA and grappling fundamentals." },
  { name: "Ariel", role: "Coach", bio: "Boxing footwork and competition prep." },
  { name: "Name", role: "Coach", bio: "Profile coming soon." },
  { name: "Name", role: "Coach", bio: "Profile coming soon." },
  { name: "Name", role: "Coach", bio: "Profile coming soon." },
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
