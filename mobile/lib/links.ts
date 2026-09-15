export const WEBSITE_URL = "https://dojokaizen2600.com";
export const GOOGLE_OAUTH_REDIRECT = "dojokaizen://auth/callback";

export const website = {
  enroll: `${WEBSITE_URL}/enroll`,
  forgotPassword: `${WEBSITE_URL}/forgot-password`,
  studentProfile: `${WEBSITE_URL}/student/profile`,
  parent: `${WEBSITE_URL}/parent`,
  admin: `${WEBSITE_URL}/admin`,
};

export function manageAccountUrl(role: string | undefined) {
  if (role === "PARENT") return website.parent;
  if (role === "STUDENT") return website.studentProfile;
  return website.admin;
}
