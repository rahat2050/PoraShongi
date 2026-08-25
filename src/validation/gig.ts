import { z } from "zod";
import { CLASS_LEVELS, SUBJECTS } from "@/config/options";

/**
 * Tutor gig ইনপুট। সংখ্যাগুলো ফর্ম থেকে স্ট্রিং হিসেবে আসে, তাই coerce করা হয়।
 * সীমাগুলো DB constraint-এর (migration 0037) সাথে হুবহু মিল রাখা হয়েছে —
 * নাহলে ডেটাবেস এরর ইউজারকে ইংরেজিতে দেখাবে।
 */
export const gigSchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, "শিরোনাম কমপক্ষে ৪ অক্ষরের হতে হবে।")
    .max(120, "শিরোনাম সর্বোচ্চ ১২০ অক্ষরের হতে পারে।"),
  description: z
    .string()
    .trim()
    .min(20, "বিবরণ কমপক্ষে ২০ অক্ষরের হতে হবে — অভিভাবক কী পড়ানো হবে তা বুঝতে চান।")
    .max(2000, "বিবরণ সর্বোচ্চ ২০০০ অক্ষরের হতে পারে।"),
  subjects: z
    .array(z.enum(SUBJECTS))
    .min(1, "কমপক্ষে ১টা বিষয় বাছুন।")
    .max(8, "সর্বোচ্চ ৮টা বিষয় বাছুন।"),
  classLevels: z
    .array(z.enum(CLASS_LEVELS))
    .min(1, "কমপক্ষে ১টা ক্লাস বাছুন।")
    .max(10, "সর্বোচ্চ ১০টা ক্লাস বাছুন।"),
  teachingMode: z.enum(["online", "offline", "both"], {
    errorMap: () => ({ message: "পড়ানোর ধরন বাছুন।" }),
  }),
  durationWeeks: z.coerce
    .number()
    .int("সপ্তাহ পূর্ণ সংখ্যা হতে হবে।")
    .min(1, "সময়কাল কমপক্ষে ১ সপ্তাহ।")
    .max(104, "সময়কাল সর্বোচ্চ ১০৪ সপ্তাহ।"),
  sessionsPerWeek: z.coerce
    .number()
    .int("সাপ্তাহিক ক্লাস সংখ্যা পূর্ণ সংখ্যা হতে হবে।")
    .min(1, "সপ্তাহে কমপক্ষে ১টি ক্লাস।")
    .max(14, "সপ্তাহে সর্বোচ্চ ১৪টি ক্লাস।"),
  price: z.coerce
    .number()
    .int("দাম পূর্ণ সংখ্যা হতে হবে।")
    .min(0, "দাম ০ বা তার বেশি হতে হবে।")
    .max(5000000, "দাম সর্বোচ্চ ৫০,০০,০০০ টাকা হতে পারে।"),
  includesTrial: z.boolean().optional(),
  /** draft = শুধু নিজের জন্য সংরক্ষিত, published = সবার জন্য দৃশ্যমান। */
  publish: z.boolean().optional(),
});

export type GigInput = z.input<typeof gigSchema>;
export type GigValues = z.infer<typeof gigSchema>;
