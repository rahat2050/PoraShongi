"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateGuardianProfile } from "@/features/profile/actions";
import { CONTACT_PREFERENCES, RELATIONSHIPS } from "@/config/options";
import { type GuardianProfile } from "@/types/index";
import { type StudentOption } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

export function GuardianProfileForm({
  data,
  students,
}: {
  data: GuardianProfile | null;
  students: StudentOption[];
}) {
  const router = useRouter();
  const [relationship, setRelationship] = useState(data?.relationship_to_student ?? "");
  const [contactPreference, setContactPreference] = useState(data?.contact_preference ?? "");
  const [linkedStudentId, setLinkedStudentId] = useState(data?.linked_student_id ?? "");
  const [bio, setBio] = useState(data?.bio ?? "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSaving(true);
    const result = await updateGuardianProfile({
      relationshipToStudent: relationship,
      contactPreference,
      linkedStudentId: linkedStudentId || undefined,
      bio: bio || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setMessage({ type: "danger", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "অভিভাবক প্রোফাইল সেভ হয়েছে।" });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="শিক্ষার্থীর সাথে সম্পর্ক" required>
          <Select value={relationship} onChange={(e) => setRelationship(e.target.value)}>
            <option value="">সম্পর্ক বাছুন</option>
            {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </FormField>
        <FormField label="যোগাযোগ মাধ্যম" required>
          <Select value={contactPreference} onChange={(e) => setContactPreference(e.target.value)}>
            <option value="">মাধ্যম বাছুন</option>
            {CONTACT_PREFERENCES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
        </FormField>
      </div>

      <FormField label="লিংকড শিক্ষার্থী" hint="যে শিক্ষার্থীর tuition আপনি manage করবেন।">
        <Select value={linkedStudentId} onChange={(e) => setLinkedStudentId(e.target.value)}>
          <option value="">কোনো শিক্ষার্থী নেই</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.display_name || s.full_name}
              {s.area ? ` — ${s.area}` : ""}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="নোট">
        <Textarea placeholder="শিক্ষকদের যা জানানো দরকার…" value={bio} onChange={(e) => setBio(e.target.value)} />
      </FormField>

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <Button type="submit" loading={saving}>সেভ করুন</Button>
      </div>
    </form>
  );
}
