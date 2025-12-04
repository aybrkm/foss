import Link from "next/link";

const stats = [
  { label: "Toplam Servet", value: "₺2.45M" },
  { label: "Bağlı banka / hesap", value: "6 hesap" },
  { label: "Takip edilen vade", value: "23 kayıt" },
];

const finPillars = [
  {
    title: "Fin OS çekirdeği",
    body: "Banka, yatırım hesabı ve manuel varlıklarını tek yerde topla; net varlığın her gün değil, her an güncel kalsın.",
  },
  {
    title: "AI değerleme motoru",
    body: "Dönen/duran varlıkların tahmini piyasa değerini AI ajanları internetten (Sahibinden vb.) tarayarak aralık bazlı günceller; sinyalleri kontrol edersin.",
  },
  {
    title: "Personal Valuables",
    body: "Drone, VR gözlük, koleksiyon parçası gibi değerli eşyalarını ekle; net worth’a katkısını ve tahmini piyasa değerini takip et.",
  },
  {
    title: "Borç + vade takibi",
    body: "Kredi, kart, kira, vergi ve diğer yükümlülüklerini vade ve tutara göre izle; SMS/email uyarıları tanımla, gecikme riskini en baştan kes.",
  },
  {
    title: "Nakit akışı & gelir",
    body: "Gelir kayıtlarını tut; entegrasyonlardan gelen hareketlerle eşleştir; SMS/email tetikleyicileriyle net nakit akışını koru.",
  },
  {
    title: "Yatırım görünümü",
    body: "Yatırım hesaplarındaki bakiyeleri çek; portföyünü, riskini ve dağılımını net gör; manuel varlıklarla beraber.",
  },
];

const lifePillars = [
  {
    title: "Workspace",
    body: "Projelerini, yapılacaklarını ve finansal kararlarını aynı timeline üzerinde organize et; kritik kartlar için SMS/email uyarıları kur.",
  },
  {
    title: "Dijivault kasası",
    body: "Google, Apple, bankalar ve diğer dijital hesaplarının bilgilerini master key ile şifreleyerek sakla.",
  },
  {
    title: "Reminders",
    body: "Ödeme, gelir, kontrol ve rapor tarihlerini hatırlatıcılarla bağla; SMS/email ile kritik şeyler unutulmasın.",
  },
  {
    title: "Journal",
    body: "Yatırım notlarını, kararlarının gerekçelerini ve günlük özetlerini sakla; geriye dönüp bakabil.",
  },
];

const steps = [
  "Hesap aç ve master key belirle.",
  "Banka / yatırım hesaplarını bağla, manuel varlık ve yükümlülüklerini ekle.",
  "Gelir, vade ve net varlık takibini Fin OS içinden sürekli güncel halde yönet.",
];

const integrations = [
  "Banka & açık bankacılık",
  "Yatırım hesapları (Plaid/IBKR)",
  "AI ile işlem sınıflandırma",
  "Manuel varlık + Life OS",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#04060d] text-slate-100">
      {/* HEADER */}
      <header className="border-b border-white/5 bg-linear-to-br from-[#0a0f2d] via-[#050816] to-[#04060d]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <div className="flex items-center gap-2 text-xl font-semibold uppercase tracking-[0.35em] text-indigo-200 md:text-2xl">
            <span className="h-3 w-3 rounded-full bg-indigo-400" />
            FLOSS
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-xl border border-white/15 px-4 py-2 font-semibold text-white hover:border-white/40"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-indigo-500 px-4 py-2 font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400"
            >
              Kayıt Ol
            </Link>
          </div>
        </div>

        {/* HERO */}
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-30 lg:flex-row lg:items-center">
          <div className="space-y-6 lg:max-w-xl">
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              Gerçek zamanlı tam entegre finansal hayat yönetim sistemi
            </h1>

            <p className="text-lg text-slate-300">
              Amaç basit: net varlığını, borçlarını, gelirlerini ve vadelerini her an güncel görmek.
              Banka ve yatırım entegrasyonları, AI ile işlem sınıflandırma ve manuel kayıtlar birleşip
              sana gerçek zamanlı bir net worth ve cashflow kokpiti kurar. Workspace, Reminders,
              Journal ve Dijivault ise bunun etrafındaki hafif Life OS katmanıdır.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-400"
              >
                Hemen Başla
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/50"
              >
                Demo
              </Link>
            </div>

            {/* Hero Stats */}
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm shadow-inner shadow-black/10"
                >
                  <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-200">
                    {s.label}
                  </p>
                  <p className="text-lg font-semibold text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="relative w-full lg:max-w-xl">
            <div className="absolute -left-8 -top-6 h-28 w-28 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute right-0 top-10 h-24 w-24 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="relative space-y-3 rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/40 backdrop-blur">
              {/* Net worth card */}
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0c1024]/80 px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-200">
                    Canlı net varlık
                  </p>
                  <p className="text-xs text-slate-300">Bankalar + yatırım hesapları + manuel varlıklar</p>
                </div>
                <p className="text-xl font-semibold text-white">₺ 2.45M</p>
              </div>

              {/* Obligation / income cards */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-rose-200">
                  Yaklaşan yükümlülük
                </p>
                <p className="text-lg font-semibold text-white">Kira + Kredi Taksiti</p>
                <p className="text-sm text-slate-300">
                  10 Aralık • ₺32.450 toplam • Vade takviminde işaretli
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200">
                    AI eşleşen gelir
                  </p>
                  <p className="text-base font-semibold text-white">Kira geliri tespit edildi</p>
                  <p className="text-sm text-slate-300">
                    10 Aralık • ₺25.000 • “Onayla” diyene kadar sadece öneri
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-200">
                    Dijivault kasası
                  </p>
                  <p className="text-base font-semibold text-white">12 hesap • 7 parola</p>
                  <p className="text-sm text-slate-300">
                    Master key ile şifreli; Life OS katmanında durur
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-6xl space-y-16 px-6 py-16">
        {/* FIN OS FEATURES */}
        <section className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">FinOS</p>
              <h2 className="text-2xl font-semibold text-white">
                Ana ürün: varlıklar, yükümlülükler, gelirler ve AI destekli net worth motoru.
              </h2>
            </div>
            <p className="max-w-md text-sm text-slate-300">
              FinOS, FLOSS’un kalbi. Banka ve yatırım entegrasyonları + manuel kayıtlar üzerinden
              sürekli güncel bir bilanço ve nakit akışı sağlar. AI worth engine dönen/duran varlıkları tarayıp
              tahmini piyasa değerini günceller. Life OS sadece destek katmanıdır.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {finPillars.map((f) => (
              <article
                key={f.title}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/20"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{f.title}</p>
                <p className="mt-2 text-sm text-slate-200">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* LIFE OS FEATURES */}
        <section className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">LifOS katmanı</p>
              <h2 className="text-2xl font-semibold text-white">
                Workspace, Reminders, Journal ve Dijivault.
              </h2>
            </div>
            <p className="max-w-md text-sm text-slate-300">
              Asıl odak finans sağlığı. LifOS modülleri; not, görev, hatırlatma ve parola kasası
              gibi hafif araçlarla bu çekirdeği destekler.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {lifePillars.map((f) => (
              <article
                key={f.title}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/20"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{f.title}</p>
                <p className="mt-2 text-sm text-slate-200">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* INTEGRATIONS + FLOW */}
        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-lg shadow-black/20">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Entegrasyon & analiz</p>

              <h2 className="text-4xl font-semibold text-white">
                FLOSS Personal & FLOSS Business için ayrı, kapsamlı entegrasyonlar. AI destekli analizler.
              </h2>

              <p className="text-sm text-slate-300">
                Hesap hareketleri, planlanmış gelir ve yükümlülük kayıtlarınla otomatik eşleştirilir;
                sistem “bu kira olabilir, bu kredi taksiti olabilir” der. Sen onaylayana kadar hiçbir
                şey kesinleşmez ama analiz her zaman hazırdır. Yükümlülük ve gelir kayıtlarına tekrar (recurrence)
                tanımladığında, tamamlanan görevler vadesine göre otomatik yeni kayda kopyalanır ve sıradaki tarihe taşınır.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {integrations.map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <ul className="grid gap-2 text-sm text-slate-300">
                <li>• Açık bankacılık: günlük/gerçek zamanlı hesap hareketleri, AI ile sınıflandırma.</li>
                <li>• Plaid/IBKR: yatırım pozisyonlarını net worth’a anında yansıtma.</li>
                <li>• SMS/Email kuralları: gelir, yükümlülük, hatırlatıcı ve Workspace kartları için özel bildirim.</li>
              </ul>
            </div>

            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">FinOS adımları</p>
              <p className="text-sm text-slate-300">
                Açık bankacılık ve yatırım entegrasyonları, AI sınıflandırma ve manuel kayıtlarla canlı net worth ve nakit akışı.
              </p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-lg shadow-black/20">
          <h3 className="text-2xl font-semibold text-white">Başlarken</h3>
          <ol className="mt-4 space-y-3 text-sm text-slate-200">
            {steps.map((s, idx) => (
              <li
                key={s}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/80 text-xs font-semibold text-white">
                  {idx + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-lg shadow-black/20">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">Başlayalım</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Finansal hayatını FinOS modüllerimiz ile kontrol altına al; bunun yanında Life OS modülleri ile de ile takibi kolaylaştır.  
          </h3>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5"
            >
              Kayıt Ol
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/50"
            >
              Giriş Yap
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
