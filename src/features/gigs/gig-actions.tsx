"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { deleteGig, setGigStatus } from "@/features/gigs/actions";
import type { GigStatus } from "@/types/index";
import { Button, buttonStyles } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

export function GigManageActions({
  gigId,
  status,
  isFlagged,
}: {
  gigId: string;
  status: GigStatus;
  isFlagged: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>, successMsg: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast(successMsg, "success");
        router.refresh();
      } else {
        toast(result.error ?? "কিছু ভুল হয়েছে।", "danger");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/dashboard/gigs/${gigId}`} className={buttonStyles({ size: "sm", variant: "outline" })}>
        <Pencil className="h-4 w-4" aria-hidden /> সম্পাদনা
      </Link>

      {isFlagged ? (
        <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
          মডারেশনে আছে — নিজে পরিবর্তন করা যাবে না
        </span>
      ) : (
        <>
          {status === "published" ? (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => run(() => setGigStatus(gigId, "draft"), "প্যাকেজ খসড়া করা হয়েছে")}
            >
              <EyeOff className="h-4 w-4" aria-hidden /> লুকান
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => run(() => setGigStatus(gigId, "published"), "প্যাকেজ প্রকাশিত হয়েছে")}
            >
              <Eye className="h-4 w-4" aria-hidden /> প্রকাশ করুন
            </Button>
          )}
          <Button size="sm" variant="danger" disabled={pending} onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" aria-hidden /> মুছুন
          </Button>
        </>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="প্যাকেজ মুছে ফেলবেন?"
        message="মুছে ফেললে আর ফেরানো যাবে না। লুকাতে চাইলে 'লুকান' ব্যবহার করুন।"
        confirmLabel="মুছে ফেলুন"
        loading={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          run(async () => {
            const result = await deleteGig(gigId);
            setConfirmDelete(false);
            return result;
          }, "প্যাকেজ মুছে ফেলা হয়েছে")
        }
      />
    </div>
  );
}
