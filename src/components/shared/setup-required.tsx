import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

/**
 * Rendered on protected pages when the app can't work yet — gives a clear,
 * actionable hint instead of a cryptic error.
 *
 * reason:
 *   "env"      — Supabase environment variables are missing.
 *   "profile"  — env is set and you're signed in, but your profile row is
 *                missing (database migrations not applied).
 */
export function SetupRequired({ reason = "env" }: { reason?: "env" | "profile" }) {
  const isProfile = reason === "profile";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <Card className="w-full max-w-xl">
        <CardContent className="space-y-5 p-8">
          <Alert
            variant="warning"
            title={
              isProfile
                ? "Database tables are missing"
                : "Supabase setup required"
            }
          >
            {isProfile
              ? "Your account is signed in, but its profile could not be found — the database migrations have not been applied yet."
              : "PoraShongi needs Supabase credentials before this page can work."}
          </Alert>

          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>
              Create a Supabase project (Free Tier works) at{" "}
              <span className="font-medium">database.new</span>.
            </li>
            <li>
              Open <span className="font-medium">SQL Editor</span> in Supabase
              and run <strong>all</strong> files in{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                supabase/migrations
              </code>{" "}
              in order (00001… then 00002…).
            </li>
            <li>
              Copy{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                .env.example
              </code>{" "}
              to{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                .env.local
              </code>{" "}
              and fill in your project URL and anon key.
            </li>
            <li>Restart the development server.</li>
          </ol>

          <p className="text-sm text-slate-500">
            Tip: open{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              /api/health
            </code>{" "}
            to see exactly what is configured and which tables are missing.
            Full instructions:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              docs/supabase-setup.md
            </code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
