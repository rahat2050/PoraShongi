import Link from "next/link";

export function TeacherDirectoryNav({
  current,
}: {
  current?:
    | "teachers"
    | "online"
    | "sunamganj"
    | "sylhet"
    | "subjects"
    | "district"
    | "exams"
    | "locations"
    | "medium"
    | "institutions"
    | "gigs";
}) {
  const links = [
    { href: "/teachers", label: "সব শিক্ষক", key: "teachers" },
    { href: "/teachers/sunamganj", label: "সুনামগঞ্জ", key: "sunamganj" },
    { href: "/teachers/sylhet", label: "সিলেট", key: "sylhet" },
    { href: "/locations", label: "সব জেলা", key: "locations" },
    { href: "/teachers/online", label: "অনলাইন শিক্ষক", key: "online" },
    { href: "/subjects", label: "বিষয়", key: "subjects" },
    { href: "/exams", label: "পরীক্ষা ও শ্রেণি", key: "exams" },
    { href: "/medium", label: "মাধ্যম", key: "medium" },
    { href: "/institutions", label: "প্রতিষ্ঠান", key: "institutions" },
    { href: "/gigs", label: "শিক্ষক প্যাকেজ", key: "gigs" },
  ] as const;

  return (
    <nav aria-label="শিক্ষক ডিরেক্টরি" className="mt-5">
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => {
          const active = current === link.key;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "inline-flex min-h-10 items-center rounded-full border border-brand-700 bg-brand-700 px-3 text-sm font-semibold text-white"
                    : "inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
