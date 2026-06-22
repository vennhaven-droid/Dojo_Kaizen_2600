import { MarketingHeader, MarketingFooter } from "@/components/marketing/site-chrome";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden marketing-gradient">
      <MarketingHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <MarketingFooter />
    </div>
  );
}
