"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { type TuitionPublic } from "@/types/index";
import { TuitionCard } from "@/components/shared/tuition-card";
import { SaveTuitionButton } from "@/components/shared/save-tuition-button";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonStyles } from "@/components/ui/button";

export function SavedTuitionGrid({ initialTuitions }: { initialTuitions: TuitionPublic[] }) {
  const [tuitions, setTuitions] = useState(initialTuitions);

  if (tuitions.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark className="h-6 w-6" aria-hidden />}
        title="এখনো কোনো টিউশন সেভ করেননি"
        description="টিউশন সুযোগ থেকে পছন্দের পোস্ট সেভ করলে এখানে দ্রুত ফিরে পাবেন।"
        action={<Link href="/tuitions" className={buttonStyles()}>টিউশন খুঁজুন</Link>}
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
      {tuitions.map((tuition, index) => (
        <Reveal key={tuition.id} delay={Math.min(index * 70, 350)} className="h-full">
          <div data-saved-tuition={tuition.id}>
            <TuitionCard
              tuition={tuition}
              action={(
                <SaveTuitionButton
                  tuitionId={tuition.id}
                  initiallySaved
                  onSavedChange={(saved) => {
                    if (!saved) setTuitions((current) => current.filter((item) => item.id !== tuition.id));
                  }}
                />
              )}
            />
          </div>
        </Reveal>
      ))}
    </div>
  );
}
