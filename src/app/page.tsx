import Link from "next/link";

const stats = [
  { label: "Portföy görünümü", value: "₺2.4M" },
  { label: "Yaklaşan ödeme", value: "₺18.450 • 3g" },
  { label: "Şifreli hesap", value: "7 parola" },
];

const pillars = [
  {
    title: "Kişisel CFO",
    body: "Varlık, borç, gelir ve aboneliklerini aynı ekranda topla; net varlık ve nakit akışı hep güncel.",
  },
  {
    title: "Şifreli kasa",
    body: "Dijital hesap parolalarını master kod ile şifrele. Paylaşsan bile çözmek için senden onay gerekir.",
  },
  {
    title: "Akıllı hatırlatma",
    body: "Yaklaşan ödemeleri, gelirleri ve kritik notları takvime göre öne çıkarır; gecikme riskini azaltır.",
  },
  {
    title: "Entegrasyon + otomasyon",
    body: "Banka, abonelik ve görev kaynaklarını bağla; vade ve kur bilgisi otomatik gelsin, görevler güncellensin.",
  },
];

const steps = [
  "Kayıt ol ve master kodunu belirle.",
  "Varlık, borç ve dijital hesaplarını ekle.",
  "Vade takvimini ve uyarıları yönetmeye başla.",
];

const integrations = [
  "Banka & açık bankacılık",
  "Kart/abonelik sağlayıcıları",
  "Görev & ticket sistemleri",
  "Kişisel bulut ve parola yöneticileri",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#04060d] text-slate-100">
      <header className="border-b border-white/5 bg-gradient-to-br from-[#0a0f2d] via-[#050816] to-[#04060d]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
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

        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 lg:flex-row lg:items-center">
          <div className="space-y-6 lg:max-w-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">Kişisel finans OS</p>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              Kişisel CFO: varlık, borç, abonelik ve parolalarını tek panelden yönet.
            </h1>
            <p className="text-lg text-slate-300">
              Varlıklarını, yükümlülüklerini ve dijital hesap parolalarını topla; master kod ile şifrele,
              vadeleri otomatik izle, gecikme riskini düşür. Hem bireysel hem kurumsal finansını aynı OS
              üzerinden yönet.
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
                Demo Giriş
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 shadow-inner shadow-black/10"
                >
                  <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-200">{item.label}</p>
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full lg:max-w-xl">
            <div className="absolute -left-8 -top-6 h-28 w-28 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute right-0 top-10 h-24 w-24 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="relative space-y-3 rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0c1024]/80 px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-200">Varlıklar</p>
                  <p className="text-sm text-slate-300">TRY + USD toplu</p>
                </div>
                <p className="text-xl font-semibold text-white">₺ 2.45M</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-rose-200">Yaklaşan ödeme</p>
                <p className="text-lg font-semibold text-white">Kredi Taksiti</p>
                <p className="text-sm text-slate-300">30 Kasım • ₺18.450 • Otomatik hatırlatma</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200">Gelir</p>
                  <p className="text-base font-semibold text-white">Serbest Proje</p>
                  <p className="text-sm text-slate-300">3 gün kaldı • $2.800</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-200">Parola kasası</p>
                  <p className="text-base font-semibold text-white">7 kayıt şifreli</p>
                  <p className="text-sm text-slate-300">Master kod sadece sende</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/20"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{feature.title}</p>
              <p className="mt-2 text-sm text-slate-200">{feature.body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-lg shadow-black/20">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Entegrasyon + CFO bakışı</p>
              <h2 className="text-3xl font-semibold text-white">
                Banka, abonelik ve görev altyapılarını bağla; finansal hayatını tepeden izle.
              </h2>
              <p className="text-sm text-slate-300">
                Açık bankacılık, abonelik sağlayıcıları ve görev sistemlerinden gelen kayıtlar tek timeline’da.
                Varlık/borç dengesi, nakit akışı ve şifreli hesaplar aynı yerde; bireysel ya da kurumsal kullanım için.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {integrations.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
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
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-lg shadow-black/20">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">Başlayalım</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Paralarını, parolalarını ve vadelerini tek yerden yönet
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
 
