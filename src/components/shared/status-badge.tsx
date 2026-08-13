import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { type RequestStatus, type TuitionStatus } from "@/types/index";

const tuitionConfig: Record<TuitionStatus, { label: string; variant: BadgeVariant }> = {
  open: { label: "Open", variant: "success" },
  assigned: { label: "Assigned", variant: "brand" },
  paused: { label: "Paused", variant: "warning" },
  completed: { label: "Completed", variant: "info" },
  closed: { label: "Closed", variant: "default" },
};

const requestConfig: Record<RequestStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: "Pending", variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
  withdrawn: { label: "Withdrawn", variant: "default" },
};

export function TuitionStatusBadge({ status }: { status: TuitionStatus }) {
  const cfg = tuitionConfig[status] ?? tuitionConfig.closed;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const cfg = requestConfig[status] ?? requestConfig.withdrawn;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
