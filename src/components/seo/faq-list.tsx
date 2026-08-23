export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqList({
  title = "সাধারণ প্রশ্ন",
  items,
}: {
  title?: string;
  items: FaqItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
      <dl className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.question} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <dt className="font-semibold text-slate-900 dark:text-slate-100">{item.question}</dt>
            <dd className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
