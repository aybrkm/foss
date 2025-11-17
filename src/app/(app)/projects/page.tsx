import {
  ProjectWorkspace,
  type CapacityItem,
  type CurrentWorkItem,
  type FollowUpItem,
  type ProjectItem,
  type TimelineItem,
} from "@/components/projects";

const projects: ProjectItem[] = [
  {
    id: "inventory-flow",
    name: "Depo raf duzeni",
    owner: "Depo",
    stage: "active",
    status: "at_risk",
    progress: 62,
    summary: "Raf sifirlama listelerini musterilerin sevdigi urun notlariyla birlestiriyorum.",
    focus: ["Not defteri", "Hafta sonu sayimi"],
    tags: ["Depo", "Rutine"],
    startDate: "2024-07-01",
    dueDate: "2024-12-28",
    budgetUsedPercentage: 68,
    nextStep: "Yeni musteriler icin sepet tercih etiketleri yaz",
  },
  {
    id: "fav-journal",
    name: "Musteri favori listesi",
    owner: "Musteri",
    stage: "follow_up",
    status: "on_track",
    progress: 47,
    summary: "Hangi musterinin hangi urunleri istedigini kaydedip sohbetlerde hazir tutuyorum.",
    focus: ["Whatsapp sablonu", "Ziyaret plan"],
    tags: ["CRM", "Not"],
    startDate: "2024-09-10",
    dueDate: "2024-12-22",
    budgetUsedPercentage: 44,
    nextStep: "Top 20 musteriyi kartlara yaz",
  },
  {
    id: "stock-app",
    name: "Stok uygulamasi v1",
    owner: "App",
    stage: "active",
    status: "on_track",
    progress: 58,
    summary: "Depoda taranan urunleri mobil app ile kaydedip rapor almayi deniyorum.",
    focus: ["Kod cleanup", "Test listesi"],
    tags: ["Kod", "Deneme"],
    startDate: "2024-08-15",
    dueDate: "2024-12-30",
    budgetUsedPercentage: 52,
    nextStep: "Beta buildi iki kisilik gruba gonder",
  },
  {
    id: "training-kit",
    name: "Depo egitim kilavuzu",
    owner: "Depo",
    stage: "idea",
    status: "on_track",
    progress: 24,
    summary: "Yeni gelenlere raf duzeni ve musteri notu anlatan resimli kilavuz hazirliyorum.",
    focus: ["Foto cekimi", "Check list"],
    tags: ["Egitim", "Materyal"],
    startDate: "2024-11-01",
    dueDate: "2025-01-15",
    budgetUsedPercentage: 18,
    nextStep: "Depo 2 icin ornek sayfa ciz",
  },
  {
    id: "restock-archive",
    name: "Eski siparis arsivi",
    owner: "Arsiv",
    stage: "archive",
    status: "on_track",
    progress: 90,
    summary: "Kapanan siparisleri duzenleyip kolay aranan bir liste haline getiriyorum.",
    focus: ["Excel filtre", "Arsiv klasoru"],
    tags: ["Arsiv", "Takip"],
    startDate: "2024-06-01",
    dueDate: "2024-12-10",
    budgetUsedPercentage: 82,
    nextStep: "PDF olarak yedekle",
  },
];

const timelineItems: TimelineItem[] = [
  {
    id: "timeline-raf",
    project: "Depo raf duzeni",
    label: "Islak alan temizligi",
    dueDate: "2024-12-06",
    status: "due-soon",
    confidence: "medium",
  },
  {
    id: "timeline-favs",
    project: "Musteri favori listesi",
    label: "Top 20 kartlari",
    dueDate: "2024-12-12",
    status: "planned",
    confidence: "high",
  },
  {
    id: "timeline-app",
    project: "Stok uygulamasi v1",
    label: "Beta build gonderimi",
    dueDate: "2024-12-18",
    status: "planned",
    confidence: "medium",
  },
  {
    id: "timeline-kit",
    project: "Depo egitim kilavuzu",
    label: "Foto cekimi",
    dueDate: "2024-12-09",
    status: "due-soon",
    confidence: "low",
  },
];

const followUps: FollowUpItem[] = [
  {
    id: "fu-1",
    project: "Depo raf duzeni",
    owner: "Tedarikci",
    type: "risk",
    dueDate: "2024-12-05",
    notes: "Yeni metal raf icin teyit bekleniyor.",
    severity: "medium",
  },
  {
    id: "fu-2",
    project: "Musteri favori listesi",
    owner: "Whatsapp",
    type: "approval",
    dueDate: "2024-12-08",
    notes: "Toplu mesaj sablonu icin onay al.",
    severity: "low",
  },
  {
    id: "fu-3",
    project: "Stok uygulamasi v1",
    owner: "Test grubu",
    type: "handoff",
    dueDate: "2024-12-11",
    notes: "Beta linkini iki magazaya gonder.",
    severity: "high",
  },
];

const capacity: CapacityItem[] = [
  {
    id: "morning-block",
    team: "Sabah depo",
    lead: "08-11",
    loadPercentage: 18,
    limitPercentage: 24,
    focus: ["Raf reset", "Siparis paket"],
  },
  {
    id: "afternoon-app",
    team: "App kod",
    lead: "13-15",
    loadPercentage: 10,
    limitPercentage: 14,
    focus: ["React ekran", "API"],
  },
  {
    id: "evening-planning",
    team: "Aksam plan",
    lead: "21-22",
    loadPercentage: 6,
    limitPercentage: 8,
    focus: ["Musteri notu", "Okuma"],
  },
];

const now = new Date();
const activeCount = projects.length;
const riskCount = projects.filter((project) => project.status !== "on_track").length;
const ideaCount = projects.filter((project) => project.stage === "idea").length;
const avgProgress =
  projects.reduce((sum, project) => sum + project.progress, 0) / Math.max(1, projects.length);

const highlights = [
  { label: "Calisma basligi", value: `${activeCount}`, hint: "aktif alan" },
  { label: "Odak isteyen", value: `${riskCount}`, hint: "yakindan bak" },
  {
    label: "Bekleyen fikir",
    value: `${ideaCount}`,
    hint: "rafa konulan",
    accent: "sky" as const,
  },
  {
    label: "Ortalama ilerleme",
    value: `${Math.round(avgProgress)}%`,
    hint: "tum akislarda",
    accent: "emerald" as const,
  },
];

const currentWorkItems: CurrentWorkItem[] = [
  {
    id: "cw-1",
    title: "Raf numara etiketi",
    project: "Depo raf duzeni",
    owner: "Depo",
    status: "in-progress",
    priority: "high",
    dueDate: "2024-12-06",
    effort: "1d",
    description: "Eksik raf numaralarini sablonla yenile.",
  },
  {
    id: "cw-2",
    title: "Islak alan temizligi",
    project: "Depo raf duzeni",
    owner: "Depo",
    status: "planned",
    priority: "medium",
    dueDate: "2024-12-07",
    effort: "0.5d",
    description: "Hafta sonu oncesi islak alanlari temizle.",
  },
  {
    id: "cw-3",
    title: "Top 20 kartlari",
    project: "Musteri favori listesi",
    owner: "Musteri",
    status: "review",
    priority: "high",
    dueDate: "2024-12-08",
    effort: "0.5d",
    description: "Kartlara isim ve favori urunleri yaz.",
  },
  {
    id: "cw-4",
    title: "Whatsapp sablon taslagi",
    project: "Musteri favori listesi",
    owner: "Musteri",
    status: "in-progress",
    priority: "medium",
    dueDate: "2024-12-10",
    effort: "1d",
    description: "Yeni yil kampanyasi icin sablon hazirla.",
  },
  {
    id: "cw-5",
    title: "Beta build paketi",
    project: "Stok uygulamasi v1",
    owner: "App",
    status: "blocked",
    priority: "asap",
    dueDate: "2024-12-09",
    effort: "0.5d",
    description: "Test kullanicisindan geri donus bekleniyor.",
  },
  {
    id: "cw-6",
    title: "Foto cekimi planla",
    project: "Depo egitim kilavuzu",
    owner: "Depo",
    status: "planned",
    priority: "low",
    dueDate: "2024-12-11",
    effort: "0.5d",
    description: "Raf duzeni adimlarini cekmek icin isik kur.",
  },
  {
    id: "cw-7",
    title: "Arsiv PDF yedegi",
    project: "Eski siparis arsivi",
    owner: "Arsiv",
    status: "done",
    priority: "medium",
    dueDate: "2024-12-04",
    effort: "0.5d",
    description: "Google Drive icin yedek olusturuldu.",
  },
];

export default function ProjectsPage() {
  return (
    <ProjectWorkspace
      projects={projects}
      highlights={highlights}
      timelineItems={timelineItems}
      followUps={followUps}
      capacity={capacity}
      currentWork={currentWorkItems}
      now={now}
    />
  );
}
