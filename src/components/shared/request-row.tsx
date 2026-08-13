import Link from "next/link";
import { type RequestDisplayRow } from "@/lib/data/requests";
import { RequestStatusBadge } from "@/components/shared/status-badge";
import { Avatar } from "@/components/ui/avatar";
import {
  SenderRequestActions,
  TeacherRequestActions,
} from "@/features/requests/request-actions";
import { formatDate } from "@/lib/utils";

export function RequestRow({
  row,
  direction,
}: {
  row: RequestDisplayRow;
  direction: "sent" | "received";
}) {
  const { request, tuition, otherName, otherAvatar } = row;

  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar src={otherAvatar} name={otherName ?? undefined} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">
            {direction === "sent" ? `To: ${otherName}` : `From: ${otherName}`}
          </p>
          <Link
            href={`/tuitions/${request.tuition_id}`}
            className="block truncate text-xs text-slate-500 hover:text-brand-700"
          >
            {tuition?.title ?? "Tuition requirement"}
          </Link>
          <p className="text-xs text-slate-400">
            {formatDate(request.created_at)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <RequestStatusBadge status={request.status} />
        {direction === "received" && request.status === "pending" && (
          <TeacherRequestActions requestId={request.id} />
        )}
        {direction === "sent" && request.status === "pending" && (
          <SenderRequestActions requestId={request.id} />
        )}
      </div>
    </div>
  );
}
