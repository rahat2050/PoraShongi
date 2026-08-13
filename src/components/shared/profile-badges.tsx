import { Badge } from "@/components/ui/badge";
import { type AccountStatus, type VerificationStatus } from "@/types/index";

const statusVariant: Record<AccountStatus, "success" | "warning" | "danger" | "default"> = {
  active: "success",
  pending: "warning",
  suspended: "danger",
  deleted: "default",
};

const statusLabel: Record<AccountStatus, string> = {
  active: "Active",
  pending: "Pending",
  suspended: "Suspended",
  deleted: "Deleted",
};

const verificationVariant: Record<
  VerificationStatus,
  "default" | "warning" | "success" | "danger"
> = {
  unverified: "default",
  pending: "warning",
  verified: "success",
  rejected: "danger",
};

const verificationLabel: Record<VerificationStatus, string> = {
  unverified: "Unverified",
  pending: "Verification pending",
  verified: "Verified",
  rejected: "Rejected",
};

export function StatusBadge({ status }: { status: AccountStatus }) {
  return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>;
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  return (
    <Badge variant={verificationVariant[status]}>{verificationLabel[status]}</Badge>
  );
}
