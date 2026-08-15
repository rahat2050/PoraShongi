import { Badge } from "@/components/ui/badge";

export function MatchBadge({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const variant = pct >= 80 ? "success" : pct >= 60 ? "brand" : pct >= 40 ? "warning" : "outline";
  return <Badge variant={variant}>{pct}% Match</Badge>;
}
