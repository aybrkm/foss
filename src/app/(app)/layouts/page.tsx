import prisma from "@/lib/prisma";

export default async function LayoutsPage() {
  const layouts = await prisma.pageLayout.findMany({
    orderBy: { pageKey: "asc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">
          Page Layouts
        </p>
        <h2 className="text-3xl font-semibold text-white">
          Panel yerleşimleri JSONB formatında
        </h2>
        <p className="max-w-2xl text-slate-300">
          page_layouts tablosu UNIQUE(user_id, page_key) + layout jsonb ile dashboard,
          assets, obligations, reminders sayfalarının düzenlerini tutar.
        </p>
      </header>

      {layouts.length === 0 && (
        <p className="text-sm text-slate-400">Henüz kayıtlı bir layout yok.</p>
      )}

      {layouts.map((layout) => (
        <section
          key={layout.id}
          className="space-y-2 rounded-3xl border border-white/10 bg-slate-900/70 p-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {layout.pageKey.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-400">
              Güncellendi: {new Date(layout.updatedAt).toLocaleString("tr-TR")}
            </p>
          </div>
          <pre className="overflow-auto text-sm leading-relaxed text-slate-200">
            {JSON.stringify(layout.layout, null, 2)}
          </pre>
        </section>
      ))}
    </div>
  );
}
