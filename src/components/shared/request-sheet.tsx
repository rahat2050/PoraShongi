"use client";

import { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { sendTuitionRequest } from "@/features/requests/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Alert } from "@/components/ui/alert";

export interface TuitionOption {
  id: string;
  title: string;
}

export function RequestSheet({
  teacherId,
  teacherName,
  tuitions,
}: {
  teacherId: string;
  teacherName: string;
  tuitions: TuitionOption[];
}) {
  const [open, setOpen] = useState(false);
  const [tuitionId, setTuitionId] = useState(tuitions[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSend() {
    setError(null);
    if (!tuitionId) {
      setError("Please choose a tuition requirement.");
      return;
    }
    setPending(true);
    const result = await sendTuitionRequest({
      tuitionId,
      teacherId,
      message: message || undefined,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Send className="h-4 w-4" aria-hidden />
        Send tuition request
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Send tuition request"
        description={`Send a request to ${teacherName}`}
      >
        {success ? (
          <div className="space-y-4">
            <Alert variant="success" title="Request sent">
              Your tuition request has been sent. The teacher will be notified.
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Link href="/dashboard/requests" className="inline-flex">
                <Button onClick={() => setOpen(false)}>View requests</Button>
              </Link>
            </div>
          </div>
        ) : tuitions.length === 0 ? (
          <div className="space-y-4">
            <Alert variant="warning" title="No tuition requirement yet">
              You need to create a tuition requirement before sending a request.
            </Alert>
            <Link href="/dashboard/tuitions/new" className="inline-flex">
              <Button onClick={() => setOpen(false)}>Create tuition</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {error && <Alert variant="danger">{error}</Alert>}
            <FormField label="Your tuition requirement" htmlFor="tuition" required>
              <Select
                id="tuition"
                value={tuitionId}
                onChange={(e) => setTuitionId(e.target.value)}
              >
                {tuitions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Message (optional)" htmlFor="message">
              <Textarea
                id="message"
                placeholder="Introduce yourself and mention any details…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend} loading={pending}>
                Send request
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
