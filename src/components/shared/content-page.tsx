import Link from "next/link";

export function ContentPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <header className="border-b border-slate-200 pb-6 dark:border-slate-700">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">সর্বশেষ হালনাগাদ: ১৬ আগস্ট ২০২৬</p>
      </header>
      <div className="space-y-8 py-8 text-slate-700 dark:text-slate-200">{children}</div>
      <footer className="border-t border-slate-200 pt-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
        প্রশ্ন থাকলে <Link href="/contact" className="font-medium text-brand-700 underline dark:text-brand-300">যোগাযোগ করুন</Link>।
      </footer>
    </article>
  );
}

export function ContentSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="mt-3 space-y-3 leading-7">{children}</div>
    </section>
  );
}

export function ContentList({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-2 pl-6">{children}</ul>;
}
