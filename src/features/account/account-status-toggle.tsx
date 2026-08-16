"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAccountActive } from "@/features/account/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function AccountStatusToggle({ current }: { current: "active" | "deleted" }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  function toggle() {
    startTransition(async () => {
      const result = await setAccountActive(current === "deleted");
      if (result.ok) {
        toast(current === "deleted" ? "অ্যাকাউন্ট আবার চালু হয়েছে" : "অ্যাকাউন্ট নিষ্ক্রিয় হয়েছে", "success");
        router.refresh();
      } else {
        toast(result.error, "danger");
      }
    });
  }

  if (current === "deleted") {
    return (
      <Button variant="primary" onClick={toggle} loading={pending}>
        অ্যাকাউন্ট আবার চালু করুন
      </Button>
    );
  }

  return (
    <>
      <Button variant="danger" onClick={() => setConfirm(true)}>
        অ্যাকাউন্ট নিষ্ক্রিয় করুন
      </Button>
      <ConfirmDialog
        open={confirm}
        title="অ্যাকাউন্ট নিষ্ক্রিয়?"
        message="নিষ্ক্রিয় করলে আপনার প্রোফাইল আর কারো কাছে দেখা যাবে না। আবার লগইন করে চালু করতে পারবেন — কোনো ডাটা মুছে যাবে না।"
        confirmLabel="হ্যাঁ, নিষ্ক্রিয় করুন"
        loading={pending}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          toggle();
        }}
      />
    </>
  );
}
