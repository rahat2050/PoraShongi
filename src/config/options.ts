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
  { value: "offline", label: "Offline (সরাসরি)" },
  { value: "online", label: "Online" },
  { value: "both", label: "দুটোই" },
] as const;

export const WEEK_DAYS = [
  "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
] as const;

export const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Night", "Flexible"] as const;

/** বাংলাদেশের বিভাগ */
export const DIVISIONS = [
  "Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal",
  "Sylhet", "Rangpur", "Mymensingh",
] as const;

/** কিছু সাধারণ জেলা */
export const DISTRICTS = [
  "Sunamganj", "Sylhet", "Moulvibazar", "Habiganj", "Dhaka", "Chattogram",
  "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh", "Cumilla",
  "Narayanganj", "Gazipur", "Bogra", "Jessore", "Dinajpur", "Pabna",
  "Cox's Bazar", "Kishoreganj", "Online / Anywhere",
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
