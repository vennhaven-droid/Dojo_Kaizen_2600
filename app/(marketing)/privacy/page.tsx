import { pageMetadata } from "@/lib/seo";
import { BRAND } from "@/lib/brand";

export const metadata = pageMetadata(
  "Privacy Policy",
  "How Dojo Kaizen 2600 collects, uses, and protects information on our website and member app."
);

const UPDATED = "8 October 2026";

const SECTIONS: { id: string; title: string; body: string[] }[] = [
  {
    id: "who",
    title: "Who we are",
    body: [
      `${BRAND.name} (“we”, “us”) operates the website ${BRAND.domain} and the Dojo Kaizen member app. We are a martial arts academy in ${BRAND.location}.`,
      `Questions about this policy: ${BRAND.email} or ${BRAND.phone}.`,
    ],
  },
  {
    id: "scope",
    title: "What this covers",
    body: [
      "This policy applies to our public website, online enrollment and contact forms, member/parent/staff portals, and the Android member app. It does not cover Facebook, Instagram, Google Play, or other sites you open from our links.",
    ],
  },
  {
    id: "collect",
    title: "Information we collect",
    body: [
      "Account and profile: name, email, password (stored hashed), phone, address, photo, and role (student, parent, coach, or staff). If you use Continue with Google, Google shares the email and name on that Google account so we can sign you in.",
      "Student records: birthday, program, membership and payment history, attendance (check-in and check-out), achievements, competitions, locker notes, and optional medical notes such as allergies or injuries that staff record for training safety.",
      "Family contacts: parent or guardian name, phone, email, and emergency contacts, especially for students under 18.",
      "Messages: contact-form inquiries, enrollment applications, and group chat messages you send inside the app or website.",
      "Technical data: login session cookies on the website, and app sign-in tokens. We do not run advertising SDKs or sell lists of users.",
    ],
  },
  {
    id: "use",
    title: "How we use it",
    body: [
      "To create and manage dojo accounts, memberships, and class check-in.",
      "To show you your own billing, attendance, records, and chat in the website or app.",
      "To email payment reminders, enrollment updates, and replies to inquiries.",
      "To run the academy (coaches and staff who need the record to teach, bill, or keep people safe).",
      "We do not use this information for ads, and we do not sell it.",
    ],
  },
  {
    id: "share",
    title: "Who we share it with",
    body: [
      "Staff and coaches at Dojo Kaizen who need it to do their job.",
      "Parents or guardians linked to a student, so they can see that student’s membership, attendance, and related records.",
      "Service providers that host or send this data for us: our website and database on our Hostinger VPS (self-hosted Supabase), Cloudinary for photos, Resend for email, and Google for optional Google Sign-In and maps on the contact page. Expo/Google Play distribute the app.",
      "We share information if the law requires it, or to protect the safety of students and staff.",
    ],
  },
  {
    id: "children",
    title: "Children and minors",
    body: [
      "The member app is a login tool for accounts the dojo creates. It is not a children’s game and is not directed at children under 13 as a public download product.",
      "We do keep student records for minors who train here when a parent or guardian enrolls them or staff creates the file. That data is used only to run classes, membership, and safety. Parents may ask us to review or update a child’s record.",
    ],
  },
  {
    id: "payments",
    title: "Payments",
    body: [
      "Membership fees are recorded by the dojo (for example cash or a payment reference). The app and website can show your balance and history. There are no in-app purchases and no ads in the app.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and sign-in",
    body: [
      "The website uses session cookies so you stay logged in. The app stores a sign-in session on the device. Clearing the session or tapping Sign out logs you out. We do not use cookies for advertising.",
    ],
  },
  {
    id: "keep",
    title: "How long we keep it",
    body: [
      "We keep account and student records while you train with us and as long as we need them for membership, safety, and ordinary academy records. You can ask us to deactivate a login or update a record. Some billing or attendance history may be kept as part of the dojo’s files.",
    ],
  },
  {
    id: "security",
    title: "Security",
    body: [
      "Access to student and billing data is limited to signed-in users and staff with permission. Passwords are not stored in plain text. No method of transmission or storage is completely secure; please keep your login private.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    body: [
      `Under the Philippines Data Privacy Act of 2012 (Republic Act No. 10173), you may ask to see, correct, or withdraw consent for personal data we hold, subject to the records we must keep to run the academy. Email ${BRAND.email} from the address on your account. We may need to confirm it is you before we change a record.`,
    ],
  },
  {
    id: "changes",
    title: "Changes",
    body: [
      "If we change this policy, we will update this page and the date below. Continued use of the website or app after an update means you accept the revised policy.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <article className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-gold">Legal</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-kaizen-gray sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-kaizen-muted">Last updated {UPDATED}</p>
        <p className="mt-6 text-kaizen-silver leading-relaxed">
          This explains what {BRAND.shortName} collects through our website and member app,
          why we collect it, and how you can reach us.
        </p>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="font-display text-xl font-bold text-gold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-kaizen-muted leading-relaxed">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section id="contact">
            <h2 className="font-display text-xl font-bold text-gold">Contact</h2>
            <p className="mt-3 text-kaizen-muted leading-relaxed">
              {BRAND.name}
              <br />
              {BRAND.location}
              <br />
              <a href={`mailto:${BRAND.email}`} className="text-blue hover:underline">
                {BRAND.email}
              </a>
              <br />
              <a href={`tel:${BRAND.phoneTel}`} className="text-blue hover:underline">
                {BRAND.phone}
              </a>
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
