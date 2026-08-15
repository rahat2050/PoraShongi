import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { type RequestStatus, type TuitionStatus } from "@/types/index";

const tuitionConfig: Record<TuitionStatus, { label: string; variant: BadgeVariant }> = {
  open: { label: "খোলা", variant: "success" },
  assigned: { label: "নিয়োগ হয়েছে", variant: "brand" },
  paused: { label: "বিরতি", variant: "warning" },
  completed: { label: "সম্পন্ন", variant: "info" },
  closed: { label: "বন্ধ", variant: "default" },
};

const requestConfig: Record<RequestStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: "অপেক্ষমাণ", variant: "warning" },
  accepted: { label: "গৃহীত", variant: "success" },
  rejected: { label: "প্রত্যাখ্যাত", variant: "danger" },
  withdrawn: { label: "প্রত্যাহার", variant: "default" },
};

export function TuitionStatusBadge({ status }: { status: TuitionStatus }) {
  const cfg = tuitionConfig[status] ?? tuitionConfig.closed;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const cfg = requestConfig[status] ?? requestConfig.withdrawn;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
