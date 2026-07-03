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
  programHighlights: [
    "/images/Home/Program/Program1.jpg",
    "/images/Home/Program/Program2.jpg",
    "/images/Home/Program/Program3.jpg",
    "/images/Home/Program/Program4.jpg",
    "/images/Home/Program/Program5.jpg",
    "/images/Home/Program/Program6.jpg",
    "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80",
  ],
  facilityGallery: [
    "/images/facility/0292f8fa-eb9a-4f37-99cd-28896564aff5.jpeg",
    "/images/facility/1b6bab46-6ae0-4e49-9f0e-cc01804cf6d9.jpeg",
    "/images/facility/232a380e-8649-4482-9721-190a76f8e177.jpeg",
    "/images/facility/7507d19a-1d4e-4974-9b01-d4c62b8a1e67.jpeg",
    "/images/facility/78dfa89a-f05b-47ca-b5a1-3a444940c062.jpeg",
    "/images/facility/92ec33f7-d175-4994-b56d-36bf379836e5.jpeg",
    "/images/facility/a5c53673-1bd0-4f3c-a365-bf8dedd60196.jpeg",
    "/images/facility/b1310821-a589-4864-ab2c-521a761f8f2d.jpeg",
    "/images/facility/b8562d4a-a115-4792-8d43-d12c9f210736.jpeg",
    "/images/facility/cb248599-8caa-40ec-aed3-a78595baf254.jpeg",
    "/images/facility/cb6136df-95c2-4f04-ab72-e3dbf35454cd.jpeg",
    "/images/facility/ceb66aaa-62c0-4368-871d-52bb6e4a76f1.jpeg",
    "/images/facility/d0a0139a-1cbb-4b47-97d6-002ccbcb9965.jpeg",
    "/images/facility/dfd96530-f274-46be-ba40-bde2d39503ad.jpeg",
    "/images/facility/e045c575-340d-40c8-804a-73bcea1ddd5a.jpeg",
    "/images/facility/f369486d-1242-4c2c-a909-0fafac68cf08.jpeg",
    "/images/facility/feee4421-56bd-48fc-be06-f413a62d54d6.jpeg",
  ],
} as const;

export const DEFAULT_PROGRAM_IMAGES: Record<string, string> = {
  "Muay Thai": "https://images.unsplash.com/photo-1555597677-b303096c6d8f?w=800&q=80",
  MMA: "https://images.unsplash.com/photo-1549719386-74dfcbf703db?w=800&q=80",
  Boxing: "https://images.unsplash.com/photo-1517438476312-10d79c0775de?w=800&q=80",
  Kickboxing: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80",
  "Kids Martial Arts": "https://images.unsplash.com/photo-1555597677-0732e8b58f38?w=800&q=80",
  "Teen Martial Arts": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
  "Self Defense": "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&q=80",
  "Fitness Conditioning": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  "Private Coaching": "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80",
  "Brazilian Jiu-Jitsu": "https://images.unsplash.com/photo-1583454110551-21f2fee2c41b?w=800&q=80",
};

export function getProgramImage(name: string, cmsUrl?: string | null): string {
  if (cmsUrl) return cmsUrl;
  return DEFAULT_PROGRAM_IMAGES[name] ?? MARKETING_IMAGES.programs;
}

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
  { name: "Kickboxing", tagline: "Power · Cardio · Technique" },
  { name: "MMA", tagline: "Striking · Grappling · Conditioning" },
  { name: "Brazilian Jiu-Jitsu", tagline: "Technique · Control · Submissions" },
] as const;

export const MARKETING_PROGRAMS = [
  { name: "Muay Thai", tagline: "Traditional Thai boxing with modern training methods." },
  { name: "MMA", tagline: "Mixed martial arts combining striking and grappling." },
  { name: "Boxing", tagline: "Classic boxing fundamentals and competition prep." },
  { name: "Kickboxing", tagline: "High-energy kickboxing for fitness and fight conditioning." },
  { name: "Kids Martial Arts", tagline: "Fun, safe martial arts for children ages 5–12." },
  { name: "Teen Martial Arts", tagline: "Dynamic training for teens ages 13–17." },
  { name: "Self Defense", tagline: "Practical self-defense for all skill levels." },
  { name: "Fitness Conditioning", tagline: "High-intensity conditioning for fighters and athletes." },
  { name: "Private Coaching", tagline: "One-on-one coaching tailored to your goals." },
] as const;

export const COACHES_TEAM = [
  { name: "Brindle", role: "Coach", bio: "Fundamentals, fight team, and academy leadership." },
  { name: "Daryll", role: "Coach", bio: "Striking and pad work specialist." },
  { name: "Glenn", role: "Coach", bio: "Muay Thai technique and conditioning." },
  { name: "Kenneth", role: "Coach", bio: "MMA and grappling fundamentals." },
  { name: "Ariel", role: "Coach", bio: "Boxing footwork and competition prep." },
] as const;

/** Fallback pricing when CMS is empty */
export const FALLBACK_PRICING = [
  { title: "Walk-in", price: 300, billing_period: "walk-in", category: "group_classes", sort_order: 1, is_promoted: false, is_published: true, features: [] },
  { title: "Student Walk-in", price: 250, billing_period: "walk-in", category: "group_classes", sort_order: 2, is_promoted: false, is_published: true, features: [] },
  { title: "Monthly / 12 Sessions", price: 2500, billing_period: "package", category: "group_classes", sort_order: 3, is_promoted: false, is_published: true, features: [] },
  { title: "Unlimited Monthly", price: 3500, billing_period: "monthly", category: "group_classes", sort_order: 4, is_promoted: true, is_published: true, features: [] },
  { title: "1 Pax", price: 500, billing_period: "session", category: "private_single", note: "Single session — expires 1 month after purchase", sort_order: 1, is_promoted: false, is_published: true, features: [] },
  { title: "2 Pax", price: 700, billing_period: "session", category: "private_single", sort_order: 2, is_promoted: false, is_published: true, features: [] },
  { title: "3 Pax", price: 900, billing_period: "session", category: "private_single", sort_order: 3, is_promoted: false, is_published: true, features: [] },
  { title: "4 Pax", price: 1100, billing_period: "session", category: "private_single", sort_order: 4, is_promoted: false, is_published: true, features: [] },
  { title: "1 Pax", price: 4000, billing_period: "package", category: "private_package", sort_order: 1, is_promoted: false, is_published: true, features: [] },
  { title: "2 Pax", price: 4500, billing_period: "package", category: "private_package", sort_order: 2, is_promoted: false, is_published: true, features: [] },
  { title: "3 Pax", price: 5000, billing_period: "package", category: "private_package", sort_order: 3, is_promoted: false, is_published: true, features: [] },
  { title: "4 Pax", price: 5500, billing_period: "package", category: "private_package", sort_order: 4, is_promoted: false, is_published: true, features: [] },
] as const;
