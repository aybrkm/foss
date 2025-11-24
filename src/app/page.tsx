import Link from "next/link";

const stats = [
  { label: "Net varlık", value: "₺2.4M" },
  { label: "Yaklaşan ödeme", value: "₺18.450 • 3g" },
  { label: "Şifreli hesap", value: "7 parola" },
];

const pillars = [
  {
    title: "Kişisel CFO",
    body: "Net varlık, borç ve nakit akışını tek ekranda yönet; taksit, kredi, abonelik ve gelirler hep güncel.",
  },
  {
    title: "Şifreli kasa",
    body: "Dijital hesap parolalarını master kod ile şifrele. Paylaşsan bile çözmek için senden onay gerekir.",
  },
  {
    title: "Akıllı hatırlatma",
    body: "Yaklaşan ödemeler, gelirler ve nakit hareketleri vadesine göre öne çıkar; gecikme riskini azaltır.",
  },
  {
    title: "Entegrasyon + otomasyon",
    body: "Banka, abonelik ve görev kaynaklarını bağla; vade ve kur bilgisi otomatik gelsin, görevler güncellensin.",
  },
];

const steps = [
  "Kayıt ol ve master kodunu belirle.",
  "Varlık, borç, gelir ve dijital hesaplarını ekle.",
  "Vade takvimini, nakit akışını ve uyarıları yönetmeye başla.",
];

const integrations = [
  "Açık bankacılık ile banka bağlantısı",
  "Kart/abonelik sağlayıcıları",
  "Broker & yatırım platformları (Plaid/IBKR)",
  "Görev & ticket sistemleri",
];

const benefits = [
  {
    title: "Tek finansal gerçeklik",
    body: "Bankalar, brokerler, abonelikler, gelir ve şirket bilançosu tek havuzda birleşir.",
  },
  {
    title: "Zaman kazandıran otomasyon",
    body: "Tekrar eden ödemeler, şirket faturaları, abonelikler ve yatırım pozisyonları kendiliğinden güncellenir.",
  },
  {
    title: "Kurumsal + bireysel tek panel",
    body: "Patronlar, girişimciler ve profesyoneller için; kişisel ve şirket katmanlarını aynı ekranda yönet.",
  },
  {
    title: "Akıllı içgörüler",
    body: "Net worth analizi, nakit akışı tahmini, yaklaşan yükümlülük uyarıları ve yatırım performansı.",
  },
];

const integrationLogos = [
  "Plaid",
  "Codat",
  "IBKR",
  "Açık Bankacılık TR",
  "Logo/Mikro",
  "Stripe Billing",
  "QuickBooks",
  "Xero",
];

const tourSections = [
  { title: "Dashboard", body: "Toplam varlık, borç, net worth trendi, yaklaşan ödemeler, gelir kutuları." },
  { title: "Varlıklar", body: "Banka, yatırım, emlak, kripto ve şirket varlıkları tek listede; Plaid/Codat ile otomatik değerler." },
  { title: "Yükümlülükler", body: "Krediler, faturalar, vergiler, dijital abonelik ödemeleri; vade ve kurla birlikte." },
  { title: "Dijital Hesaplar", body: "Platform giriş bilgileri + otomatik abonelik yönetimi, master kodla şifreli." },
  { title: "Nakit Akışı", body: "Gelir yönetimi, geçmiş + geleceğe dönük tahmin ve uyarılar; AI destekli eşleştirme." },
  { title: "Yatırımlar", body: "Pozisyonlar, performans, dağılım; Plaid/IBKR ile gerçek zamanlı net worth’a yansır." },
  { title: "Workspace", body: "Görevler, notlar, hatırlatmalar; finansal timeline’ı destekleyen ek katman." },
];

const testimonials = [
  {
    quote: "“FLOSS sayesinde kişisel ve şirket finansını aynı ekranda tutuyorum; nakit açığı sürpriz olmuyor.”",
    name: "Ebru • Girişimci",
  },
  {
    quote: "“Abonelikler ve ödemeler otomatik akıyor, yatırım değerlerim Plaid ile anında TRY’ye çevriliyor.”",
    name: "Kerem • CTO",
  },
  {
    quote: "“Parolalar master kodla şifreli, ekip paylaşsa bile benden onay almadan açılmıyor.”",
    name: "Derya • Finans Direktörü",
  },
];

const faqs = [
  { q: "Veriler nasıl korunuyor?", a: "Parolalar master kod ile istemci tarafında şifrelenir; veritabanında hash + şifreli kayıt tutarız." },
  { q: "Hangi entegrasyonlar var?", a: "Plaid/Codat, IBKR, TR açık bankacılık aggregator’ları, Stripe Billing, Logo/Mikro ve görev sistemleri sırada." },
  { q: "Bireysel ve kurumsal ayrımı var mı?", a: "Evet; kişisel ve şirket katmanları ayrı tutulur, ama tek dashboard’dan yönetilir." },
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
            <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">Finans OS</p>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              Kişisel CFO: varlık, borç, abonelik ve parolalarını tek panelden yönet.
            </h1>
            <p className="text-lg text-slate-300">
              Net varlık, borç, abonelik ve gelirlerini tek panelde topla; master kodla şifrele. Vade ve kur bilgisi
              otomatik çekilsin, nakit akışın her sabah güncel olsun. Life OS ekleri ikincil; ana odak finans sağlığı.
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
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1024]/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.28em] text-indigo-200">Canlı demo</p>
                <p className="text-sm text-slate-300">Net worth yükseliyor, yükümlülük kartları güncelleniyor, entegrasyonlardan veri akıyor.</p>
                <div className="mt-3 h-40 rounded-xl bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/15 to-emerald-500/20">
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-slate-400">
                    Video/animasyon alanı
                  </div>
                </div>
              </div>
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
          {benefits.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/20"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">{item.title}</p>
              <p className="mt-2 text-sm text-slate-200">{item.body}</p>
            </article>
          ))}
        </section>

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

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-[#0b1027] p-6 shadow-lg shadow-black/30">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Finans odaklı</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Net varlık + nakit akışı</h2>
            <p className="mt-2 text-sm text-slate-300">
              Varlık/borç dengesini, tahsilat ve ödeme akışını aynı yerde gör. TRY/USD/AED dönüşümleri, vade takvimi ve hatırlatmalar otomatik.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/30">
            <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-200">Şifreli kayıtlar</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Master kodla güvenlik</h2>
            <p className="mt-2 text-sm text-slate-300">
              Dijital hesap parolaları master kodla şifrelenir; sadece sen açarsın. Ekip içi paylaşımda dahi çözmek için onay gerekir.
            </p>
          </article>
          <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-black/30">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Life OS ikinci planda</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Not, görev, entegrasyon ekleri</h2>
            <p className="mt-2 text-sm text-slate-300">
              Finans ana kadroda; günlük/görev eklentileri opsiyonel. Not ve ticket entegrasyonları, finansal timeline’ı desteklemek için var.
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-lg shadow-black/20">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">Entegrasyonlar</p>
                <h3 className="text-2xl font-semibold text-white">Tek tıklamayla bağlanır, saniyeler içinde içeri akar.</h3>
                <p className="text-sm text-slate-300">
                  ABD: Plaid, Codat, IBKR; TR: açık bankacılık aggregator’ları, broker ve muhasebe bağlantıları. Yapay zeka,
                  gerçek zamanlı banka hareketlerini yükümlülük/gelirlerle eşleştirip sana CFO gibi bildirim atar.
                </p>
              </div>
              <Link
                href="/register"
                className="hidden rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/50 md:inline-flex"
              >
                Bağla ve dene
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {integrationLogos.map((logo) => (
                <div key={logo} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-slate-200">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tourSections.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/20"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.title}</p>
              <p className="mt-2 text-sm text-slate-200">{item.body}</p>
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
                Açık bankacılık ile banka hareketlerini bağlayıp yapay zeka destekli gelir-gider analizi ve
                kategorilendirme yapıyoruz; CFO tarzı gerçek zamanlı harcama uyarıları gönderiyoruz. Plaid/Codat
                üzerinden broker ve yatırım platformlarını ekleyerek net worth modülüne anlık yansıtıyoruz. Hareketler
                yükümlülük ve gelirlerle otomatik eşleşir; sistem izler, sen sadece gerektiğinde müdahale edersin.
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
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Master kod şifreleme</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">KVKK uyumlu</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">PCI DSS altyapısı</span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-black/20"
            >
              <p className="text-sm text-slate-200">{item.quote}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.25em] text-indigo-200">{item.name}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-lg shadow-black/20">
          <h3 className="text-xl font-semibold text-white">Sık Sorulanlar</h3>
          <div className="mt-4 space-y-3">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm font-semibold text-white">{item.q}</p>
                <p className="text-sm text-slate-300">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
 
