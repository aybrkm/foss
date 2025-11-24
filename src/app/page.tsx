import Link from "next/link";

const highlights = [
  { label: "Varlık + yükümlülük takibi", value: "Tek panel" },
  { label: "Şifreli kasa", value: "Master kod ile" },
  { label: "Hatırlatıcı + görev", value: "Otomatik vade" },
];

const featureCards = [
  {
    title: "Portföy görünürlüğü",
    body: "Tüm varlıklarını ve borçlarını tek ekranda gör, TRY/USD gibi para birimlerine anında çevir.",
  },
  {
    title: "Şifreli dijital hesaplar",
    body: "Parola ve abonelik bilgilerini master kod ile şifrele, ekip içi paylaşımı güvenle yap.",
  },
  {
    title: "Hatırlatmalar ve akış",
    body: "Ödemeleri, gelirleri ve doküman notlarını vade bazlı akışta takip et, gecikmeleri yakala.",
  },
];

const steps = [
  "Kayıt ol ve master kodunu belirle.",
  "Varlık, yükümlülük ve dijital hesaplarını ekle.",
  "Vade takvimini ve uyarıları tek panelden yönet.",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:py-20">
          <div className="space-y-6 lg:max-w-2xl">
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">FLOSS</p>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              Kişisel finans OS: varlık, borç, şifreli hesap ve hatırlatma tek yerde.
            </h1>
            <p className="text-lg text-slate-300">
              Varlıklarını, yükümlülüklerini ve abonelik parolalarını tek panelde topla. Master kod ile
              şifrele, yaklaşan vadeleri otomatik hesapla, gecikmeden haberdar ol.
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
                Giriş Yap
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">{item.label}</p>
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative w-full max-w-lg self-start rounded-3xl border border-white/10 bg-black/30 p-6 shadow-2xl">
            <div className="absolute right-6 top-6 h-16 w-16 rounded-full bg-emerald-500/20 blur-2xl" />
            <div className="absolute -left-10 -top-8 h-20 w-20 rounded-full bg-indigo-500/10 blur-2xl" />
            <div className="relative space-y-4 text-sm text-slate-200">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-xs uppercase tracking-[0.3em] text-indigo-200">Varlıklar</span>
                <span className="text-lg font-semibold text-white">₺ 2.45M</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-rose-200">Yaklaşan Ödeme</p>
                <p className="mt-1 text-xl font-semibold text-white">Kredi Taksiti</p>
                <p className="text-sm text-slate-300">30 Kasım • ₺18.450 • Otomatik hatırlatma açık</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Gelir Akışı</p>
                  <p className="text-lg font-semibold text-white">Serbest Proje</p>
                  <p className="text-sm text-slate-300">3 gün kaldı • $2.800</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">Parola Kasası</p>
                  <p className="text-lg font-semibold text-white">7 kayıt şifreli</p>
                  <p className="text-sm text-slate-300">Master kod: yalnızca sende</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-12 px-6 py-12">
        <section className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-lg shadow-black/20"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{feature.title}</p>
              <p className="mt-2 text-base text-slate-200">{feature.body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-8">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">3 adımda başla</p>
              <h2 className="text-3xl font-semibold text-white">Dakikalar içinde hazır</h2>
              <p className="text-sm text-slate-300">
                FLOSS’u SaaS olarak kullanabilir, kendi veritabanına bağlayabilir veya ekip arkadaşlarınla
                paylaşabilirsin. Şifreli kayıtlar master kod ile korunur.
              </p>
            </div>
            <ol className="space-y-3 text-sm text-slate-200">
              {steps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/80 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5"
            >
              Kayıt Ol
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/50"
            >
              Giriş Yap
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
 
