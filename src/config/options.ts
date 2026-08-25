/** Shared option lists for PoraSathi forms & filters. */
export const CLASS_LEVELS = [
  "Play–KG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "SSC", "HSC", "Admission Test", "University", "Other",
] as const;

export const GROUPS = ["Science", "Commerce", "Humanities", "General", "Not applicable"] as const;

export const SUBJECTS = [
  "Bengali", "English", "Mathematics", "Higher Math", "Physics", "Chemistry",
  "Biology", "ICT", "General Science", "Accounting", "Finance", "Business Studies",
  "Economics", "Geography", "History", "Social Science", "Bangladesh Studies",
  "Computer Science", "Statistics", "Arabic", "Islamic Studies", "Other",
] as const;

export const TEACHING_MODES = [
  { value: "offline", label: "সরাসরি" },
  { value: "online", label: "অনলাইন" },
  { value: "both", label: "অনলাইন ও সরাসরি" },
] as const;

/**
 * পড়ানোর মাধ্যম (curriculum)। শিক্ষক প্রোফাইলে `medium` কলামে এই value-গুলো যায়।
 * ফিল্টার, SEO ল্যান্ডিং ও প্রোফাইল ফর্ম — তিন জায়গাতেই একই তালিকা ব্যবহৃত হয়।
 */
export const TEACHING_MEDIUMS = [
  { value: "bangla", label: "বাংলা মাধ্যম", short: "Bangla Medium" },
  { value: "english", label: "ইংলিশ মিডিয়াম", short: "English Medium" },
  { value: "english_version", label: "ইংলিশ ভার্সন", short: "English Version" },
  { value: "o_a_level", label: "ও / এ লেভেল", short: "O & A Level" },
  { value: "madrasa", label: "মাদ্রাসা", short: "Madrasa" },
  { value: "other", label: "অন্যান্য", short: "Other" },
] as const;

export type TeachingMedium = (typeof TEACHING_MEDIUMS)[number]["value"];

export function mediumLabel(value?: string | null): string | null {
  if (!value) return null;
  return TEACHING_MEDIUMS.find((item) => item.value === value)?.label ?? null;
}

export function isKnownMedium(value?: string | null): value is TeachingMedium {
  return Boolean(value && TEACHING_MEDIUMS.some((item) => item.value === value));
}

/**
 * উল্লেখযোগ্য প্রতিষ্ঠান — SEO ল্যান্ডিং ও প্রোফাইল ব্যাজ দুটোতেই ব্যবহৃত।
 * `keyword` দিয়ে `search_teachers(p_institution)`-এ ILIKE সার্চ হয়, তাই শিক্ষক
 * প্রোফাইলে নামের যেকোনো বানান থাকলেও মেলে।
 */
export const NOTABLE_INSTITUTIONS = [
  { keyword: "dhaka university", label: "ঢাকা বিশ্ববিদ্যালয়", en: "University of Dhaka", slug: "dhaka-university" },
  { keyword: "buet", label: "বুয়েট", en: "BUET", slug: "buet" },
  { keyword: "dhaka medical", label: "ঢাকা মেডিকেল কলেজ", en: "Dhaka Medical College", slug: "dhaka-medical-college" },
  { keyword: "jahangirnagar", label: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়", en: "Jahangirnagar University", slug: "jahangirnagar-university" },
  { keyword: "rajshahi university", label: "রাজশাহী বিশ্ববিদ্যালয়", en: "University of Rajshahi", slug: "rajshahi-university" },
  { keyword: "chittagong university", label: "চট্টগ্রাম বিশ্ববিদ্যালয়", en: "University of Chittagong", slug: "chittagong-university" },
  { keyword: "north south", label: "নর্থ সাউথ বিশ্ববিদ্যালয়", en: "North South University", slug: "north-south-university" },
  { keyword: "brac university", label: "ব্র্যাক বিশ্ববিদ্যালয়", en: "BRAC University", slug: "brac-university" },
  { keyword: "shahjalal", label: "শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়", en: "SUST", slug: "sust" },
  { keyword: "islamic university", label: "ইসলামী বিশ্ববিদ্যালয়", en: "Islamic University", slug: "islamic-university" },
] as const;

export type NotableInstitution = (typeof NOTABLE_INSTITUTIONS)[number];

export const WEEK_DAYS = [
  "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
] as const;

export const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Night", "Flexible"] as const;

/** বাংলাদেশের বিভাগ */
export const DIVISIONS = [
  "Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal",
  "Sylhet", "Rangpur", "Mymensingh",
] as const;

/** বাংলাদেশের ৬৪ জেলা (বিভাগ অনুযায়ী), সঙ্গে online-only option। */
export const DISTRICTS = [
  // Dhaka Division
  "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur",
  "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari",
  "Shariatpur", "Tangail",
  // Chattogram Division
  "Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Cumilla",
  "Cox's Bazar", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati",
  // Rajshahi Division
  "Bogura", "Chapainawabganj", "Joypurhat", "Naogaon", "Natore", "Pabna",
  "Rajshahi", "Sirajganj",
  // Khulna Division
  "Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna", "Kushtia",
  "Magura", "Meherpur", "Narail", "Satkhira",
  // Barishal Division
  "Barguna", "Barishal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur",
  // Sylhet Division
  "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet",
  // Rangpur Division
  "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari",
  "Panchagarh", "Rangpur", "Thakurgaon",
  // Mymensingh Division
  "Jamalpur", "Mymensingh", "Netrokona", "Sherpur",
  "Online / Anywhere",
] as const;

export const RELATIONSHIPS = [
  "Father", "Mother", "Brother", "Sister", "Uncle", "Aunt", "Grandparent", "Other",
] as const;

export const CONTACT_PREFERENCES = [
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "in_app", label: "In-app message" },
] as const;

/** Distance radius options (km) — "কত কাছে/কত দূরে" */
export const DISTANCE_RADIUS = [
  { value: "", label: "যেকোনো দূরত্ব" },
  { value: "2", label: "২ কিমি-এর ভিতরে" },
  { value: "5", label: "৫ কিমি-এর ভিতরে" },
  { value: "10", label: "১০ কিমি-এর ভিতরে" },
  { value: "15", label: "১৫ কিমি-এর ভিতরে" },
] as const;
