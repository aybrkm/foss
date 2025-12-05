import { requireUserId } from "@/lib/auth";

export default async function AnalysisPage() {
  await requireUserId();

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-teal-400/40 bg-teal-500/10 p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-teal-200">Analiz</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Analitik &amp; raporlar</h1>
        <p className="mt-2 max-w-3xl text-sm text-teal-100/80">
          Yakında: portföy dağılımı, yükümlülük/gelir trendleri, ve nakit akış projeksiyonlarını burada görebileceksin.
        </p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300">
        Analiz ekranı henüz hazır değil. Önerdiğin metrikler ya da grafikler varsa paylaşırsan ekleyelim.
      </div>
    </div>
  );
}
