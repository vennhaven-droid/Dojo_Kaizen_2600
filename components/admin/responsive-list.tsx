import { cn } from "@/lib/utils";

export function AdminTableShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-blue/20 bg-kaizen-dark/30", className)}>
      {children}
    </div>
  );
}

export function ResponsiveTable({
  desktop,
  mobile,
}: {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
}) {
  return (
    <>
      <div className="hidden md:block">{desktop}</div>
      <div className="space-y-3 md:hidden">{mobile}</div>
    </>
  );
}

export function MobileRecordCard({
  title,
  subtitle,
  badge,
  rows,
  footer,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  rows?: { label: string; value: React.ReactNode }[];
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("rounded-xl border border-blue/20 bg-kaizen-dark p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-kaizen-gray break-words">{title}</p>
          {subtitle && <p className="mt-0.5 text-xs text-kaizen-muted break-words">{subtitle}</p>}
        </div>
        {badge}
      </div>
      {rows && rows.length > 0 && (
        <dl className="mt-3 space-y-2 border-t border-blue/10 pt-3">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[minmax(0,7rem)_1fr] gap-2 text-sm">
              <dt className="text-kaizen-muted">{row.label}</dt>
              <dd className="text-kaizen-gray break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {footer && <div className="mt-3 border-t border-blue/10 pt-3">{footer}</div>}
    </article>
  );
}

export function MobileEmptyState({ message }: { message: string }) {
  return <p className="rounded-xl border border-blue/20 p-8 text-center text-kaizen-muted">{message}</p>;
}
