"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { addCourse } from "@/features/ecosystem/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";

export function CoachingCourseForm({ centerId }: { centerId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await addCourse(centerId, {
      title,
      description: description || undefined,
      price: price ? Number(price) : null,
    });
    setPending(false);
    if (!result.ok) {
      toast(result.error, "danger");
      return;
    }
    toast("কোর্স যোগ হয়েছে", "success");
    setTitle("");
    setDescription("");
    setPrice("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden /> কোর্স যোগ করুন
      </Button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-800 dark:bg-brand-950/30">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="কোর্সের নাম" htmlFor="course-title" required>
          <Input id="course-title" value={title} onChange={(event) => setTitle(event.target.value)} minLength={2} maxLength={120} required />
        </FormField>
        <FormField label="বর্ণনা" htmlFor="course-description">
          <Textarea id="course-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={1000} rows={3} />
        </FormField>
        <FormField label="ফি (৳)" htmlFor="course-price">
          <Input id="course-price" type="number" min={0} max={10000000} value={price} onChange={(event) => setPrice(event.target.value)} />
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>বাতিল</Button>
          <Button type="submit" loading={pending}>যোগ করুন</Button>
        </div>
      </form>
    </div>
  );
}
