import { Card } from "@/components/ui/primitives";

export type DocSection = { title: string; body: string };

export function LegalDoc({ intro, sections, updated }: { intro: string; sections: DocSection[]; updated: string }) {
  return (
    <div className="space-y-4 p-5">
      <p className="px-1 text-sm leading-relaxed text-gray-500">{intro}</p>
      <Card className="divide-y divide-brand-dark/5 px-5">
        {sections.map((s, i) => (
          <section key={s.title} className="py-4">
            <h2 className="text-sm font-bold text-brand-dark">
              <span className="mr-1.5 text-brand-600">{i + 1}.</span>
              {s.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{s.body}</p>
          </section>
        ))}
      </Card>
      <p className="px-1 text-[11px] text-gray-400">Terakhir diperbarui: {updated}</p>
    </div>
  );
}
