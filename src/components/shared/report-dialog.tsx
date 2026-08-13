"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { submitReport } from "@/features/reports/actions";
import { type Report } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";

const CATEGORIES: { value: Report["category"]; label: string }[] = [
  { value: "fake_profile", label: "Fake profile" },
  { value: "harassment", label: "Harassment" },
  { value: "inappropriate", label: "Inappropriate behavior" },
  { value: "scam", label: "Scam" },
  { value: "spam", label: "Spam" },
  { value: "safety_concern", label: "Safety concern" },
  { value: "other", label: "Other" },
];

export function ReportButton({
  targetType,
  targetId,
  label = "Report",
  size = "sm",
  variant = "ghost",
}: {
  targetType: Report["target_type"];
  targetId: string;
  label?: string;
  size?: "sm" | "md";
  variant?: "ghost" | "outline";
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Report["category"]>("other");
  const [details, setDetails] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  async function handleSubmit() {
    setMessage(null);
    setPending(true);
    const result = await submitReport({ targetType, targetId, category, details: details || undefined });
    setPending(false);
    if (!result.ok) {
      setMessage({ type: "danger", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "Thank you — your report was submitted for review." });
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <Flag className="h-4 w-4" aria-hidden />
        {label}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Report" description="Help keep PoraShongi safe.">
        {message ? (
          <div className="space-y-3">
            <Alert variant={message.type}>{message.text}</Alert>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label="Reason" required>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as Report["category"])}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Details (optional)">
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what happened…"
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={pending}>
                Submit report
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
