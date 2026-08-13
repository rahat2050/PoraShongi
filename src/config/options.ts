/**
 * Shared option lists for PoraShongi forms and filters.
 * Keep these in sync with the vocabulary used in the database columns
 * (class_level, subject, preferred_days, teaching_mode, …).
 */

export const CLASS_LEVELS = [
  "Play–KG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "SSC",
  "HSC",
  "Admission Test",
  "University",
  "Other",
] as const;

export const GROUPS = [
  "Science",
  "Commerce",
  "Humanities",
  "General",
  "Not applicable",
] as const;

export const SUBJECTS = [
  "Bengali",
  "English",
  "Mathematics",
  "Higher Math",
  "Physics",
  "Chemistry",
  "Biology",
  "ICT",
  "General Science",
  "Accounting",
  "Finance",
  "Business Studies",
  "Economics",
  "Geography",
  "History",
  "Social Science",
  "Bangladesh Studies",
  "Computer Science",
  "Statistics",
  "Psychology",
  "Logic",
  "Agriculture",
  "Arabic",
  "Islamic Studies",
  "Religious Studies",
  "Other",
] as const;

export const TEACHING_MODES = [
  { value: "offline", label: "Offline (home / coaching)" },
  { value: "online", label: "Online" },
  { value: "both", label: "Both" },
] as const;

export const WEEK_DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Night", "Flexible"] as const;

export const DISTRICTS = [
  "Sunamganj",
  "Sylhet",
  "Moulvibazar",
  "Habiganj",
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
  "Narayanganj",
  "Gazipur",
  "Bogra",
  "Jessore",
  "Dinajpur",
  "Pabna",
  "Cox's Bazar",
  "Kishoreganj",
  "Online / Anywhere",
] as const;

export const CONTACT_PREFERENCES = [
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "in_app", label: "In-app messages" },
] as const;

export const RELATIONSHIPS = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Uncle",
  "Aunt",
  "Grandparent",
  "Other relative",
  "Other",
] as const;

export const EXPERIENCE_OPTIONS = ["0", "1", "2", "3", "5", "8", "10"] as const;
