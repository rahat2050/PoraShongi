"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBlogPost } from "@/features/features-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";

const CATEGORIES = [
  { value: "study_tips", label: "পড়াশোনার টিপস" },
  { value: "ssc", label: "SSC প্রস্তুতি" },
  { value: "hsc", label: "HSC প্রস্তুতি" },
  { value: "career", label: "ক্যারিয়ার" },
  { value: "scholarship", label: "স্কলারশিপ" },
  { value: "teacher_tips", label: "শিক্ষকদের টিপস" },
  { value: "news", label: "শিক্ষা সংবাদ" },
];

export function BlogForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("study_tips");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await createBlogPost({
      title,
      slug: slug || title,
      excerpt: excerpt || undefined,
      content,
      category,
    });
    setPending(false);
    if (!result.ok) {
      toast(result.error, "danger");
      return;
    }
    toast("পোস্ট প্রকাশিত হয়েছে", "success");
    router.push(`/blog/${result.data.slug}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="টাইটেল" required>
        <Input placeholder="যেমন: SSC Math-এ ভালো করার ৫টা টিপস" value={title} onChange={(e) => setTitle(e.target.value)} minLength={3} maxLength={160} required />
      </FormField>
      <FormField label="Slug (লিংকের জন্য)" hint="খালি রাখলে টাইটেল থেকে বানাবে">
        <Input placeholder="ssc-math-tips" value={slug} onChange={(e) => setSlug(e.target.value)} maxLength={120} />
      </FormField>
      <FormField label="ক্যাটাগরি">
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </Select>
      </FormField>
      <FormField label="সংক্ষিপ্ত বর্ণনা (excerpt)">
        <Input placeholder="এক লাইনে পোস্টের সারমর্ম…" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={500} />
      </FormField>
      <FormField label="কনটেন্ট" required>
        <Textarea rows={8} placeholder="পুরো লেখা এখানে…" value={content} onChange={(e) => setContent(e.target.value)} minLength={10} maxLength={20000} required />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" loading={pending}>প্রকাশ করুন</Button>
      </div>
    </form>
  );
}
