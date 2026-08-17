"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCoachingCenter } from "@/features/ecosystem/actions";
import { DISTRICTS } from "@/config/options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";

export function CoachingForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await createCoachingCenter({ name, district: district || undefined, area: area || undefined, contact: contact || undefined, description: description || undefined });
    setPending(false);
    if (!result.ok) {
      toast(result.error, "danger");
      return;
    }
    toast("কোচিং সেন্টার তৈরি হয়েছে", "success");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>কোচিং সেন্টার যোগ করুন</Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="max-h-[calc(100dvh-5rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 shadow-xl sm:max-h-[calc(100vh-2rem)] dark:bg-slate-800" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="coaching-dialog-title">
            <h2 id="coaching-dialog-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">কোচিং সেন্টার</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <FormField label="নাম" required>
                <Input placeholder="যেমন: FS Coaching Center" value={name} onChange={(e) => setName(e.target.value)} />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="জেলা">
                  <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
                    <option value="">জেলা বাছুন</option>
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </FormField>
                <FormField label="এলাকা">
                  <Input placeholder="থানা/উপজেলা" value={area} onChange={(e) => setArea(e.target.value)} />
                </FormField>
              </div>
              <FormField label="যোগাযোগ">
                <Input placeholder="ফোন / ইমেইল" value={contact} onChange={(e) => setContact(e.target.value)} />
              </FormField>
              <FormField label="বর্ণনা">
                <Textarea placeholder="সেন্টার সম্পর্কে…" value={description} onChange={(e) => setDescription(e.target.value)} />
              </FormField>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>বাতিল</Button>
                <Button type="submit" loading={pending}>তৈরি করুন</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
