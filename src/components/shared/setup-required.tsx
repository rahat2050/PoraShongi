import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

/**
 * Rendered on protected pages when Supabase environment variables are
 * missing — gives the developer a clear, actionable hint instead of a
 * cryptic error.
 */
export function SetupRequired() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <Card className="w-full max-w-xl">
        <CardContent className="space-y-5 p-8">
          <Alert variant="warning" title="Supabase setup required">
            PoraShongi needs Supabase credentials before this page can work.
          </Alert>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
            <li>
              Create a Supabase project (Free Tier works) at{" "}
              <span className="font-medium">database.new</span>.
            </li>
            <li>
              Run the SQL migrations in{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                supabase/migrations
              </code>{" "}
              in the Supabase SQL editor.
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
