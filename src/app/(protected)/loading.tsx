import { Spinner } from "@/components/ui/spinner";

export default function ProtectedLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Spinner label="Loading your workspace…" />
        <p className="text-sm">Loading your workspace…</p>
      </div>
    </div>
  );
}
