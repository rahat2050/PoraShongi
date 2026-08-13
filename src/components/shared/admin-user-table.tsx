import { ROLE_LABELS } from "@/lib/auth/roles";
import { type Profile } from "@/types/index";
import { Avatar } from "@/components/ui/avatar";
import {
  StatusBadge,
  VerificationBadge,
} from "@/components/shared/profile-badges";
import {
  AdminAccountStatusButton,
  AdminVerifyButton,
} from "@/features/admin/admin-actions";
import { formatDateTime } from "@/lib/utils";

export function AdminUserTable({
  profiles,
  showVerify = false,
}: {
  profiles: Profile[];
  showVerify?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Verification</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {profiles.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={row.avatar_url}
                    name={row.full_name ?? row.display_name}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium text-slate-800">
                      {row.full_name ?? row.display_name ?? "—"}
                    </p>
                    <p className="text-xs text-slate-400">{row.id.slice(0, 8)}…</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-700">
                {ROLE_LABELS[row.role].en}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={row.account_status} />
              </td>
              <td className="px-4 py-3">
                <VerificationBadge status={row.verification_status} />
              </td>
              <td className="px-4 py-3 text-slate-500">
                {formatDateTime(row.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {showVerify && row.verification_status !== "verified" && (
                    <AdminVerifyButton teacherId={row.id} />
                  )}
                  {row.role !== "admin" && (
                    <AdminAccountStatusButton
                      userId={row.id}
                      suspended={row.account_status === "suspended"}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
