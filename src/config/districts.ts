import { DIVISIONS } from "@/config/options";

/**
 * বাংলাদেশের ৬৪ জেলার ক্যানোনিকাল তথ্য — SEO ল্যান্ডিং পেজ ও `/locations`
 * ডিরেক্টরির একমাত্র উৎস। `name` অবশ্যই `DISTRICTS`-এর মানের সাথে হুবহু মিলবে,
 * কারণ `search_teachers(p_district => ...)` এই মান দিয়েই ফিল্টার করে।
 */
export type DistrictInfo = {
  name: string;
  nameBn: string;
  division: (typeof DIVISIONS)[number];
};

export const DISTRICT_INFO: readonly DistrictInfo[] = [
  // Dhaka Division
  { name: "Dhaka", nameBn: "ঢাকা", division: "Dhaka" },
  { name: "Faridpur", nameBn: "ফরিদপুর", division: "Dhaka" },
  { name: "Gazipur", nameBn: "গাজীপুর", division: "Dhaka" },
  { name: "Gopalganj", nameBn: "গোপালগঞ্জ", division: "Dhaka" },
  { name: "Kishoreganj", nameBn: "কিশোরগঞ্জ", division: "Dhaka" },
  { name: "Madaripur", nameBn: "মাদারীপুর", division: "Dhaka" },
  { name: "Manikganj", nameBn: "মানিকগঞ্জ", division: "Dhaka" },
  { name: "Munshiganj", nameBn: "মুন্সিগঞ্জ", division: "Dhaka" },
  { name: "Narayanganj", nameBn: "নারায়ণগঞ্জ", division: "Dhaka" },
  { name: "Narsingdi", nameBn: "নরসিংদী", division: "Dhaka" },
  { name: "Rajbari", nameBn: "রাজবাড়ী", division: "Dhaka" },
  { name: "Shariatpur", nameBn: "শরীয়তপুর", division: "Dhaka" },
  { name: "Tangail", nameBn: "টাঙ্গাইল", division: "Dhaka" },
  // Chattogram Division
  { name: "Bandarban", nameBn: "বান্দরবান", division: "Chattogram" },
  { name: "Brahmanbaria", nameBn: "ব্রাহ্মণবাড়িয়া", division: "Chattogram" },
  { name: "Chandpur", nameBn: "চাঁদপুর", division: "Chattogram" },
  { name: "Chattogram", nameBn: "চট্টগ্রাম", division: "Chattogram" },
  { name: "Cumilla", nameBn: "কুমিল্লা", division: "Chattogram" },
  { name: "Cox's Bazar", nameBn: "কক্সবাজার", division: "Chattogram" },
  { name: "Feni", nameBn: "ফেনী", division: "Chattogram" },
  { name: "Khagrachhari", nameBn: "খাগড়াছড়ি", division: "Chattogram" },
  { name: "Lakshmipur", nameBn: "লক্ষ্মীপুর", division: "Chattogram" },
  { name: "Noakhali", nameBn: "নোয়াখালী", division: "Chattogram" },
  { name: "Rangamati", nameBn: "রাঙ্গামাটি", division: "Chattogram" },
  // Rajshahi Division
  { name: "Bogura", nameBn: "বগুড়া", division: "Rajshahi" },
  { name: "Chapainawabganj", nameBn: "চাঁপাইনবাবগঞ্জ", division: "Rajshahi" },
  { name: "Joypurhat", nameBn: "জয়পুরহাট", division: "Rajshahi" },
  { name: "Naogaon", nameBn: "নওগাঁ", division: "Rajshahi" },
  { name: "Natore", nameBn: "নাটোর", division: "Rajshahi" },
  { name: "Pabna", nameBn: "পাবনা", division: "Rajshahi" },
  { name: "Rajshahi", nameBn: "রাজশাহী", division: "Rajshahi" },
  { name: "Sirajganj", nameBn: "সিরাজগঞ্জ", division: "Rajshahi" },
  // Khulna Division
  { name: "Bagerhat", nameBn: "বাগেরহাট", division: "Khulna" },
  { name: "Chuadanga", nameBn: "চুয়াডাঙ্গা", division: "Khulna" },
  { name: "Jashore", nameBn: "যশোর", division: "Khulna" },
  { name: "Jhenaidah", nameBn: "ঝিনাইদহ", division: "Khulna" },
  { name: "Khulna", nameBn: "খুলনা", division: "Khulna" },
  { name: "Kushtia", nameBn: "কুষ্টিয়া", division: "Khulna" },
  { name: "Magura", nameBn: "মাগুরা", division: "Khulna" },
  { name: "Meherpur", nameBn: "মেহেরপুর", division: "Khulna" },
  { name: "Narail", nameBn: "নড়াইল", division: "Khulna" },
  { name: "Satkhira", nameBn: "সাতক্ষীরা", division: "Khulna" },
  // Barishal Division
  { name: "Barguna", nameBn: "বরগুনা", division: "Barishal" },
  { name: "Barishal", nameBn: "বরিশাল", division: "Barishal" },
  { name: "Bhola", nameBn: "ভোলা", division: "Barishal" },
  { name: "Jhalokati", nameBn: "ঝালকাঠি", division: "Barishal" },
  { name: "Patuakhali", nameBn: "পটুয়াখালী", division: "Barishal" },
  { name: "Pirojpur", nameBn: "পিরোজপুর", division: "Barishal" },
  // Sylhet Division
  { name: "Habiganj", nameBn: "হবিগঞ্জ", division: "Sylhet" },
  { name: "Moulvibazar", nameBn: "মৌলভীবাজার", division: "Sylhet" },
  { name: "Sunamganj", nameBn: "সুনামগঞ্জ", division: "Sylhet" },
  { name: "Sylhet", nameBn: "সিলেট", division: "Sylhet" },
  // Rangpur Division
  { name: "Dinajpur", nameBn: "দিনাজপুর", division: "Rangpur" },
  { name: "Gaibandha", nameBn: "গাইবান্ধা", division: "Rangpur" },
  { name: "Kurigram", nameBn: "কুড়িগ্রাম", division: "Rangpur" },
  { name: "Lalmonirhat", nameBn: "লালমনিরহাট", division: "Rangpur" },
  { name: "Nilphamari", nameBn: "নীলফামারী", division: "Rangpur" },
  { name: "Panchagarh", nameBn: "পঞ্চগড়", division: "Rangpur" },
  { name: "Rangpur", nameBn: "রংপুর", division: "Rangpur" },
  { name: "Thakurgaon", nameBn: "ঠাকুরগাঁও", division: "Rangpur" },
  // Mymensingh Division
  { name: "Jamalpur", nameBn: "জামালপুর", division: "Mymensingh" },
  { name: "Mymensingh", nameBn: "ময়মনসিংহ", division: "Mymensingh" },
  { name: "Netrokona", nameBn: "নেত্রকোণা", division: "Mymensingh" },
  { name: "Sherpur", nameBn: "শেরপুর", division: "Mymensingh" },
] as const;

/** বিভাগের বাংলা নাম — `/locations`-এ গ্রুপিং-এর জন্য। */
export const DIVISION_NAMES_BN: Record<(typeof DIVISIONS)[number], string> = {
  Dhaka: "ঢাকা বিভাগ",
  Chattogram: "চট্টগ্রাম বিভাগ",
  Rajshahi: "রাজশাহী বিভাগ",
  Khulna: "খুলনা বিভাগ",
  Barishal: "বরিশাল বিভাগ",
  Sylhet: "সিলেট বিভাগ",
  Rangpur: "রংপুর বিভাগ",
  Mymensingh: "ময়মনসিংহ বিভাগ",
};

/**
 * বাংলা সম্বন্ধ পদ। স্বরচিহ্ন (মাত্রা), চন্দ্রবিন্দু বা "ও"-র পরে শুধু "র" বসে,
 * ব্যঞ্জন বা স্বতন্ত্র স্বরবর্ণের পরে "ের" —
 * তাই ঢাকা → ঢাকার, ফেনী → ফেনীর, নওগাঁ → নওগাঁর, কিন্তু সিলেট → সিলেটের।
 * ৬৪ জেলার জন্য হাতে লিখলে ভুল হওয়ার ঝুঁকি থাকে, তাই নিয়ম দিয়েই তৈরি হয়।
 */
export function banglaPossessive(nameBn: string): string {
  const last = [...nameBn].at(-1) ?? "";
  const code = last.codePointAt(0) ?? 0;
  const isMatra = code >= 0x09be && code <= 0x09cc; // া ি ী ু ূ ৃ ে ৈ ো ৌ …
  if (isMatra || last === "ঁ" || last === "ও") return `${nameBn}র`;
  return `${nameBn}ের`;
}
