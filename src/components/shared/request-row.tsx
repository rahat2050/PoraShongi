import Link from "next/link";
import { type RequestDisplayRow } from "@/lib/data/requests";
import { RequestStatusBadge } from "@/components/shared/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { SenderRequestActions, TeacherRequestActions } from "@/features/requests/request-actions";
import { formatDate } from "@/lib/utils";

export function RequestRow({
  row,
  direction,
  bordered = true,
}: {
  row: RequestDisplayRow;
  direction: "sent" | "received";
  /** List-item animation wrappers move the divider to the wrapper. */
  bordered?: boolean;
}) {
  const { request, tuition, other } = row;
  const otherName = other?.display_name || other?.full_name || "সদস্য";

  return (
    <div className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${bordered ? "border-b border-slate-100 dark:border-slate-700" : ""}`}>
      <div className="flex min-w-0 items-center gap-3">
        <Avatar src={other?.avatar_url ?? null} name={otherName} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
            {direction === "sent" ? `প্রতি: ${otherName}` : `থেকে: ${otherName}`}
          </p>
          <Link href={`/tuitions/${request.tuition_id}`} className="block truncate text-xs text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300">
            {tuition?.title ?? "টিউশন"}
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(request.created_at)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
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
