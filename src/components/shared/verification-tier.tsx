import { Badge, type BadgeVariant } from "@/components/ui/badge";

export type Tier = "unverified" | "phone" | "education" | "identity" | "trusted";

const tierConfig: Record<Tier, { label: string; variant: BadgeVariant }> = {
  unverified: { label: "অযাচাইকৃত", variant: "default" },
  phone: { label: "ফোন ভেরিফাইড", variant: "info" },
  education: { label: "শিক্ষাগত যোগ্যতা ভেরিফাইড", variant: "brand" },
  identity: { label: "আইডেন্টিটি ভেরিফাইড", variant: "success" },
  trusted: { label: "Trusted Tutor", variant: "accent" },
};

export function VerificationTierBadge({ tier }: { tier?: Tier | null }) {
  const cfg = tierConfig[tier ?? "unverified"] ?? tierConfig.unverified;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
