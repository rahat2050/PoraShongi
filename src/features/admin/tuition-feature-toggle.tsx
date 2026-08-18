"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { adminSetTuitionFeatured } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function AdminTuitionFeatureToggle({ tuitionId, featured, open }: { tuitionId: string; featured: boolean; open: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  return (
    <Button
      size="sm"
      variant={featured ? "secondary" : "outline"}
      disabled={pending || (!open && !featured)}
      title={!open && !featured ? "শুধু খোলা টিউশন feature করা যায়" : undefined}
      onClick={() => startTransition(async () => {
        const result = await adminSetTuitionFeatured(tuitionId, !featured);
        if (!result.ok) return toast(result.error, "danger");
        toast(featured ? "Featured থেকে সরানো হয়েছে" : "টিউশন Featured হয়েছে", "success");
        router.refresh();
      })}
    >
      <Sparkles className="h-4 w-4" aria-hidden /> {featured ? "Featured বন্ধ" : "Feature করুন"}
    </Button>
  );
}
