const placeholderItems = [
  {
    title: "Aylık girişler",
    description: "Maaş, freelance ve diğer tekrar eden gelir kalemleri burada görünecek.",
  },
  {
    title: "Aylık çıkışlar",
    description: "Faturalar, hedefler ve otomatik ödemeler bu bölümde toplanacak.",
  },
  {
    title: "Öngörülen bakiye",
    description: "Gelir/ gider planı baz alınarak ileri tarihli nakit durumu hesaplanacak.",
  },
];

export default function CashflowPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">NAKİT AKIŞI</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Nakit akışı görünümü</h1>
        <p className="mt-1 text-sm text-emerald-100/80">
          Yakında, tüm gelir ve gider projeksiyonların bu sayfadan yönetilecek.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {placeholderItems.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-200"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">{item.title}</p>
            <p className="mt-2 text-slate-100">{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
