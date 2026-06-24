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
  { name: "Brindle", role: "Coach", bio: "Fundamentals, fight team, and academy leadership." },
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
