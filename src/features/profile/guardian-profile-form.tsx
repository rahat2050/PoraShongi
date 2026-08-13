"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateGuardianProfile } from "@/features/profile/actions";
import { CONTACT_PREFERENCES, RELATIONSHIPS } from "@/config/options";
import { type GuardianProfile } from "@/types/index";
import { type StudentOption } from "@/lib/data/profiles";
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
    setMessage({ type: "success", text: "Guardian profile saved." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Relationship to student" htmlFor="relationship" required>
          <Select
            id="relationship"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
          >
            <option value="">Select relationship</option>
            {RELATIONSHIPS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Contact preference" htmlFor="contactPreference" required>
          <Select
            id="contactPreference"
            value={contactPreference}
            onChange={(e) => setContactPreference(e.target.value)}
          >
            <option value="">Select preference</option>
            {CONTACT_PREFERENCES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField
        label="Linked student"
        htmlFor="linkedStudentId"
        hint="The student whose tuition you manage."
      >
        <Select
          id="linkedStudentId"
          value={linkedStudentId}
          onChange={(e) => setLinkedStudentId(e.target.value)}
        >
          <option value="">No linked student</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.display_name || s.full_name}
              {s.location ? ` — ${s.location}` : ""}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Notes" htmlFor="bio">
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Anything teachers should know…"
        />
      </FormField>

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <Button type="submit" loading={saving}>
          Save guardian profile
        </Button>
      </div>
    </form>
  );
}
