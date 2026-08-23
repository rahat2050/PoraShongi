/**
 * Affiliate / referral programme configuration.
 *
 * এখানে সব শর্ত এক জায়গায় রাখা হয়েছে যাতে পাবলিক পেজ, ড্যাশবোর্ড ও ভবিষ্যতের
 * payout hisab একই উৎস থেকে আসে।
 *
 * ⚠️ সততা নীতি: রেফারেল গণনা স্বয়ংক্রিয় (`referrals` টেবিল), কিন্তু পুরস্কার
 * এখনো **manual** — Admin যাচাই করে Premium দিন যোগ করেন। তাই কোথাও নগদ
 * টাকার নিশ্চিত প্রতিশ্রুতি দেওয়া হয় না। Automatic payout চালু হলে এই ফাইল ও
 * `/affiliate` পেজ একসাথে আপডেট হবে।
 */

export const affiliateConfig = {
  /** Premium দিনে প্রকাশিত পুরস্কার (নগদ নয়)। */
  rewardUnit: "Premium দিন",
  /** একজন রেফার করা ব্যবহারকারী সক্রিয় হলে যত দিন Premium যোগ হয়। */
  daysPerReferral: 15,
  /** পুরস্কার পাওয়ার শর্ত — যাচাইযোগ্য রাখা হয়েছে। */
  qualifyingAction: "প্রোফাইল সম্পূর্ণ করে প্রথম টিউশন অনুরোধ বা আবেদন",
  /** ম্যানুয়াল রিভিউয়ের সময়। */
  reviewWindowBn: "৭ কর্মদিবস",
  payoutIsManual: true,
} as const;

export const AFFILIATE_TIERS = [
  {
    name: "শুরু",
    range: "১–৪ জন",
    reward: `প্রতি রেফারেলে ${affiliateConfig.daysPerReferral} দিন Premium`,
  },
  {
    name: "নিয়মিত",
    range: "৫–১৯ জন",
    reward: "উপরের সুবিধা + প্রোফাইলে “Community Partner” ব্যাজ",
  },
  {
    name: "পার্টনার",
    range: "২০+ জন",
    reward: "আলাদা পার্টনার শর্ত — Admin-এর সঙ্গে সরাসরি আলোচনা",
  },
] as const;
