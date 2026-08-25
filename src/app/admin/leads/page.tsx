import type { Metadata } from "next";
import { Inbox, Mail, MapPin, Phone } from "lucide-react";
import { listTutorLeads } from "@/lib/data/leads";
import { type TutorLeadStatus } from "@/types/index";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LeadStatusButtons } from "@/features/leads/lead-actions";
import { buildQueryString, firstParam, formatDateTime, formatTaka, modeLabel } from "@/lib/utils";

export const metadata: Metadata = { title: "অ্যাডমিন — শিক্ষক চাওয়ার অনুরোধ" };
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<TutorLeadStatus, BadgeVariant> = {
  new: "danger",
  contacted: "warning",
  matched: "success",
  closed: "default",
  spam: "outline",
};

const STATUS_LABELS: Record<TutorLeadStatus, string> = {
  new: "নতুন",
  contacted: "যোগাযোগ হয়েছে",
  matched: "শিক্ষক মিলেছে",
  closed: "বন্ধ",
  spam: "স্প্যাম",
};

const FILTERS: Array<{ value?: TutorLeadStatus; label: string }> = [
  { value: undefined, label: "সব" },
  { value: "new", label: "নতুন" },
  { value: "contacted", label: "যোগাযোগ হয়েছে" },
  { value: "matched", label: "শিক্ষক মিলেছে" },
  { value: "closed", label: "বন্ধ" },
  { value: "spam", label: "স্প্যাম" },
];

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const statusParam = firstParam(sp.status);
  const status: TutorLeadStatus | undefined = (
    ["new", "contacted", "matched", "closed", "spam"] as const
  ).includes(statusParam as TutorLeadStatus)
    ? (statusParam as TutorLeadStatus)
    : undefined;

  const result = await listTutorLeads(status, 100);
  const leads = result.data ?? [];

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">পাবলিক &ldquo;শিক্ষক চাই&rdquo; অনুরোধ</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          লগইন ছাড়া আসা অনুরোধ। যোগাযোগ করে উপযুক্ত শিক্ষক মিলিয়ে দিন, তারপর স্ট্যাটাস আপডেট করুন।
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = status === filter.value;
          return (
            <a
              key={filter.label}
              href={`/admin/leads${buildQueryString({ status: filter.value })}`}
              className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-sm font-medium transition-colors ${
                active
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              {filter.label}
            </a>
          );
        })}
      </div>

      {result.error ? (
        <EmptyState icon={<Inbox className="h-6 w-6" aria-hidden />} title="লিড লোড করা যায়নি" description={result.error} />
      ) : leads.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-6 w-6" aria-hidden />}
          title="কোনো অনুরোধ নেই"
          description="পাবলিক /hire-tutor ফর্ম থেকে অনুরোধ এলে এখানে দেখা যাবে।"
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{leads.length}টি অনুরোধ</p>
          <div className="space-y-4">
            {leads.map((lead) => (
              <Card key={lead.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{lead.contact_name}</h3>
                        <Badge variant={STATUS_VARIANT[lead.status]}>{STATUS_LABELS[lead.status]}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
                        <a href={`tel:+88${lead.contact_phone}`} className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:underline dark:text-brand-300">
                          <Phone className="h-3.5 w-3.5" aria-hidden /> {lead.contact_phone}
                        </a>
                        {lead.contact_email && (
                          <a href={`mailto:${lead.contact_email}`} className="inline-flex items-center gap-1.5 hover:underline">
                            <Mail className="h-3.5 w-3.5" aria-hidden /> {lead.contact_email}
                          </a>
                        )}
                        {(lead.area || lead.district) && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                            {[lead.area, lead.district].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{formatDateTime(lead.created_at)}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Badge variant="brand">{lead.class_level}</Badge>
                    {lead.subjects.map((subject) => (
                      <Badge key={subject} variant="accent">{subject}</Badge>
                    ))}
                    <Badge variant="outline">{modeLabel(lead.teaching_mode)}</Badge>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-slate-400">বাজেট</dt>
                      <dd className="font-medium text-slate-700 dark:text-slate-200">{formatTaka(lead.budget)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">সময়</dt>
                      <dd className="font-medium text-slate-700 dark:text-slate-200">{lead.preferred_time || "যেকোনো"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">দিন</dt>
                      <dd className="truncate font-medium text-slate-700 dark:text-slate-200">
                        {lead.preferred_days.length ? lead.preferred_days.join(", ") : "যেকোনো"}
                      </dd>
                    </div>
                  </dl>

                  {lead.note && (
                    <p className="mt-4 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      {lead.note}
                    </p>
                  )}

                  {lead.admin_note && (
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      <strong>অ্যাডমিন নোট:</strong> {lead.admin_note}
                    </p>
                  )}

                  <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
                    <LeadStatusButtons leadId={lead.id} status={lead.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
