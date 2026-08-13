import { Badge } from "@/components/ui/badge";

/** Explainable match score badge, e.g. "92% Match". */
export function MatchBadge({ score, className }: { score: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const variant = pct >= 80 ? "success" : pct >= 60 ? "brand" : pct >= 40 ? "warning" : "outline";
  return (
    <Badge variant={variant} className={className}>
      {pct}% Match
    </Badge>
  );
}
