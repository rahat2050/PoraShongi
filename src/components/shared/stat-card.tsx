import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CountUp } from "@/components/motion/count-up";

function StatValue({ value }: { value: string | number }) {
  if (typeof value === "number") {
    return <CountUp value={value} duration={900} className="text-2xl font-bold text-slate-900 dark:text-slate-100" />;
  }
  return <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>;
}

export function StatCard({
  label,
  value,
  icon,
  href,
  hrefLabel,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  hrefLabel?: string;
}) {
  const body = (
    <CardContent className="flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-300">
        {icon}
      </div>
      <div className="min-w-0">
        <StatValue value={value} />
        <p className="truncate text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </CardContent>
  );

  if (href) {
    return (
      <Link href={href} className="block" aria-label={hrefLabel ?? label}>
        <Card className="transition-shadow hover:shadow-md">{body}</Card>
      </Link>
    );
  }

  return <Card>{body}</Card>;
}
