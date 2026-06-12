/**
 * Dojo Kaizen brand tokens — extracted from official logo & Facebook page.
 * @see https://www.facebook.com/profile.php?id=100084453027782
 */

export const BRAND = {
  name: "Dojo Kaizen Martial Arts 2600",
  shortName: "Dojo Kaizen 2600",
  tagline: "Kaizen Martial Arts",
  location: "Top Floor Palangdao Bldg., Lower General Luna, Baguio City 2600, Philippines",
  phone: "0967 584 2594",
  phoneTel: "+639675842594",
  facebook: "https://www.facebook.com/profile.php?id=100084453027782",
  hours: "Mon–Sun: 5:00 AM – 10:00 PM",
} as const;

/** Official profile / logo image from Facebook (same asset user provided) */
export const LOGO_REMOTE =
  "https://scontent-sin11-1.xx.fbcdn.net/v/t39.30808-1/362240416_254612364030529_6825864332398915003_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x2048&ctp=s720x720&_nc_cat=105&ccb=1-7&_nc_sid=3ab345&_nc_ohc=yxoe1BCPY-8Q7kNvwEFWF9i&_nc_oc=AdpY1-snPTdovQeT7x9BVC08qabGFl2xLAa26W-uiu1jqZGjw_LYOJTCYugP4SssG2A&_nc_zt=24&_nc_ht=scontent-sin11-1.xx&_nc_gid=ulmu0XZi6mm71kEJ_BbC2A&_nc_ss=72100&oh=00_Af-8bS40AGd9kkntv73U9ubUFTmfG64gn8F_uFp0143OzQ&oe=6A31ABE6";

/** Prefer local logo.png when present; remote fallback for preview */
export const LOGO_SRC = "/logo.png";

/**
 * Marketing imagery — profile photo from Facebook page.
 * Add more files to public/images/gallery/ to override locally.
 */
export const MARKETING_IMAGES = {
  hero: LOGO_REMOTE,
  about: LOGO_REMOTE,
  programs: LOGO_REMOTE,
  coaches: LOGO_REMOTE,
  facility: LOGO_REMOTE,
  gallery: [LOGO_REMOTE, LOGO_REMOTE, LOGO_REMOTE, LOGO_REMOTE],
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
