/**
 * PoraSathi-র নির্মাতার তথ্য — হোমপেজের Developer section ও footer credit-এ
 * ব্যবহার হয়। উৎস: https://www.rahatahmed.site/en
 */

export const developer = {
  name: "Rahat Ahmed",
  nameBangla: "রাহাত আহমেদ",
  role: "Web Developer",
  roleBangla: "ওয়েব ডেভেলপার",
  byline: "Creator of RahatVerse",
  headline: "I build modern websites & web applications",
  headlineBangla: "আধুনিক ওয়েবসাইট ও ওয়েব অ্যাপ্লিকেশন তৈরি করি",
  bio: "Sunamganj-এর একজন ওয়েব ডেভেলপার — ব্যবসা ও ব্যক্তিগত ব্র্যান্ডের জন্য দ্রুত, responsive ও SEO-ready ওয়েবসাইট তৈরি করি। প্রতিটি প্রজেক্টে মধ্যস্থতাকারী ছাড়া সরাসরি ডেভেলপারের সাথে কাজ হয়।",
  location: "Sunamganj, Bangladesh",
  languages: ["বাংলা", "English"],
  quote: "মানুষের পাশে দাঁড়ানো, শেখা আর শেখানো — এই তিনটি জিনিস আমাকে এগিয়ে নিয়ে যায়।",
  quoteByline: "— Rahat Ahmed",

  avatarUrl:
    "https://res.cloudinary.com/kbc3dfnj/image/upload/v1786125213/rahatverse/profile/1786125213546.jpg",
  logoUrl:
    "https://res.cloudinary.com/kbc3dfnj/image/upload/c_pad,w_192,h_192,b_transparent,r_max,f_png,q_auto/v1786455518/file_00000000ae388207be40b5dcd3c9a81b_jygogn.png",

  badges: [
    { label: "Web Developer", icon: "code" },
    { label: "Blood Donor", icon: "heart" },
    { label: "BNCC Cadet", icon: "shield" },
  ],

  tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "Cloudinary"],

  stats: [
    { value: 9, suffix: "", label: "অর্জন", labelEn: "Achievements" },
    { value: 5, suffix: "×", label: "১ম স্থান", labelEn: "1st Places" },
    { value: 4, suffix: "", label: "রক্তদান", labelEn: "Blood Donations" },
    { value: 2, suffix: "×", label: "GPA 5.00", labelEn: "GPA 5.00" },
  ],

  links: {
    portfolio: "https://www.rahatahmed.site/en",
    about: "https://www.rahatahmed.site/en/about",
    order: "https://www.rahatahmed.site/en/order",
    contact: "https://www.rahatahmed.site/en/contact",
    github: "https://github.com/rahatahmedbd",
  },
} as const;
