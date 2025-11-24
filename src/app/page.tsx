import Link from "next/link";

const stats = [
  { label: "Net Varlık Takibi", value: "₺2.45M" },
  { label: "Yaklaşan Ödeme", value: "₺18.450 • 3g" },
  { label: "Şifreli Kayıt", value: "7 parola" },
];

const pillars = [
  {
    title: "Net Worth Engine",
    body: "Tüm varlıklarını, borçlarını, aboneliklerini ve vadeli ödemelerini tek çekirdekte topla. TRY/USD/AED dönüşümleri otomatik.",
  },
  {
    title: "Obligation Engine",
    body: "Kredi, taksit, abonelik ve vergi gibi tüm ödemelerin vade, tutar ve recurrence’a göre sürekli güncel kalsın.",
  },
  {
    title: "Encrypted Vault",
    body: "Tüm dijital hesap parolalarını master key ile şifrele. Kasan olabildiğince sade, güvenli ve sadece senin kontrolünde.",
  },
  {
    title: "Zero-Friction Automations",
    body: "Bankalar, kartlar, abonelik sağlayıcıları ve görev kaynaklarını bağla; veriler her sabah otomatik yenilensin.",
  },
];

const steps = [
  "Hesap oluştur ve master key belirle.",
  "Varlık, borç, gelir ve dijital hesaplarını ekle.",
  "Nakit akışı, vade takvimi ve hatırlatmalar otomatik oluşsun.",
];

const integrations = [
  "Banka & açık bankacılık",
  "Kart & abonelik sağlayıcıları",
  "Görev sistemleri",
  "Life OS entegrasyonları",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#04060d] text-slate-100">
      {/* HEADER */}
      <header className="border-b border-white/5 bg-linear-to-br from-[#0a0f2d] via-[#050816] to-[#04060d]">
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

        {/* HERO */}
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 lg:flex-row lg:items-center">
          <div className="space-y-6 lg:max-w-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">Finansal İşletim Sistemi</p>

            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              Kişisel CFO: Tüm finansal gerçekliğini tek panelde yönet.
            </h1>

            <p className="text-lg text-slate-300">
              Banka, kredi, abonelik, vergi, gelir, borç ve parolalar… Hepsi tek çekirdekte birleşir. 
              Net varlığın sürekli güncellenir; vadeler otomatik işlenir; finansal hayatın hiçbir zaman karanlıkta kalmaz.
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
                  <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-200">{s.label}</p>
                  <p className="text-lg font-semibold text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative w-full lg:max-w-xl">
            <div className="absolute -left-8 -top-6 h-28 w-28 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="absolute right-0 top-10 h-24 w-24 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="relative space-y-3 rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0c1024]/80 px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-200">Toplam Varlık</p>
                  <p className="text-xs text-slate-300">TRY + USD toplu</p>
                </div>
                <p className="text-xl font-semibold text-white">₺ 2.45M</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-rose-200">Yaklaşan ödeme</p>
                <p className="text-lg font-semibold text-white">Kredi Taksiti</p>
                <p className="text-sm text-slate-300">30 Kasım • ₺18.450</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-200">Gelir</p>
                  <p className="text-base font-semibold text-white">Serbest Proje</p>
                  <p className="text-sm text-slate-300">$2.800 • 3g kaldı</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-200">Kasa</p>
                  <p className="text-base font-semibold text-white">7 parola şifreli</p>
                  <p className="text-sm text-slate-300">Master key sadece sende</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-6xl space-y-12 px-6 py-16">
        {/* FEATURES */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/20"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{f.title}</p>
              <p className="mt-2 text-sm text-slate-200">{f.body}</p>
            </article>
          ))}
        </section>

        {/* MID SECTION */}
        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-[#0b1027] p-6 shadow-lg shadow-black/30">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Finans çekirdeği</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Net varlık + nakit akışı</h2>
            <p className="mt-2 text-sm text-slate-300">
              Tüm varlık/borç dengesi, nakit giriş-çıkışı, vadeler ve kur dönüşümleri otomatik bir araya gelir.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/30">
            <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">Güvenli çekirdek</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Master key ile şifreleme</h2>
            <p className="mt-2 text-sm text-slate-300">
              Dijital parolalar tek bir kasada, master key ile şifrelenmiş şekilde saklanır.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/30">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Life OS ekleri</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Not, görev, entegrasyon</h2>
            <p className="mt-2 text-sm text-slate-300">
              Finans ana odak. Life OS modülleri yalnızca destek katmanı olarak bulunur.
            </p>
          </article>
        </section>

        {/* INTEGRATION + STEPS */}
        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-lg shadow-black/20">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Derin entegrasyon</p>

              <h2 className="text-3xl font-semibold text-white">
                Bankalarını, aboneliklerini ve görev kaynaklarını bağla. Hepsi otomatik akar.
              </h2>

              <p className="text-sm text-slate-300">
                Açık bankacılık, abonelik sağlayıcıları, bulut hesaplar ve görev sistemlerinden gelen veriler tek timeline’da birleşir.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {integrations.map((i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    {i}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <ol className="space-y-3 text-sm text-slate-200">
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
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center shadow-lg shadow-black/20">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">Başlayalım</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Finansal hayatını tek panelde yönet.
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