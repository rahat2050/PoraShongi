import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { type VerificationTier } from "@/types/index";

const tierConfig: Record<VerificationTier, { label: string; variant: BadgeVariant }> = {
  unverified: { label: "Unverified", variant: "default" },
  phone: { label: "Phone verified", variant: "info" },
  education: { label: "Education verified", variant: "brand" },
  identity: { label: "Identity verified", variant: "success" },
  trusted: { label: "Trusted Tutor", variant: "accent" },
};

export function VerificationTierBadge({ tier }: { tier?: VerificationTier | null }) {
  const cfg = tierConfig[tier ?? "unverified"] ?? tierConfig.unverified;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function tierLabel(tier?: VerificationTier | null): string {
  return tierConfig[tier ?? "unverified"]?.label ?? "Unverified";
}
