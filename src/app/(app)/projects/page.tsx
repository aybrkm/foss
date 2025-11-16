const roadmap = [
  {
    title: "Gündemdeki projeler",
    description: "Aktif projeler burada listelenecek ve durum etiketleriyle takip edilecek.",
  },
  {
    title: "Kaynak planı",
    description: "Zaman, bütçe ve ekip dağılımı için görseller eklenecek.",
  },
  {
    title: "Risk & notlar",
    description: "Her proje için kilit riskler ve alınacak aksiyonlar özetlenecek.",
  },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-fuchsia-400/40 bg-fuchsia-500/10 p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-fuchsia-200">PROJECTS</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Proje yönetim alanı</h1>
        <p className="mt-1 text-sm text-fuchsia-100/80">
          Fikirden teslimata kadar tüm adımlar için pano yakında hazır olacak.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {roadmap.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-200"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">{item.title}</p>
            <p className="mt-2 text-slate-100">{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
