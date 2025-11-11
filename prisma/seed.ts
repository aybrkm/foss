import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "founder@foss.app" },
    create: {
      email: "founder@foss.app",
      name: "FOSS Founder",
    },
    update: {},
  });

  await prisma.asset.deleteMany({ where: { userId: user.id } });
  await prisma.obligation.deleteMany({ where: { userId: user.id } });
  await prisma.reminder.deleteMany({ where: { userId: user.id } });
  await prisma.journalEntry.deleteMany({ where: { userId: user.id } });
  await prisma.pageLayout.deleteMany({ where: { userId: user.id } });

  await prisma.asset.createMany({
    data: [
      {
        userId: user.id,
        name: "Garanti Vadesiz",
        assetType: "cash",
        isLiquid: true,
        currentValue: 125_400,
        currency: "TRY",
        notes: "Günlük harcama hesabı.",
      },
      {
        userId: user.id,
        name: "BIST 30 ETF",
        assetType: "investment",
        isLiquid: true,
        currentValue: 84_250,
        currency: "TRY",
        notes: "Uzun vadeli birikim.",
      },
      {
        userId: user.id,
        name: "Arnavutköy Arsa",
        assetType: "land",
        isLiquid: false,
        currentValue: 3_200_000,
        currency: "TRY",
        notes: "Ekspertiz süreci takipte.",
      },
      {
        userId: user.id,
        name: "Lisbon Flat",
        assetType: "real_estate",
        isLiquid: false,
        currentValue: 420_000,
        currency: "EUR",
        notes: "Kısa dönem kiralama hedefi.",
      },
    ],
  });

  const obligationRecords = await prisma.$transaction(
    [
      {
        name: "Kredi Kartı - QNB",
        category: "payment",
        amount: 38_640,
        currency: "TRY",
        frequency: "monthly",
        nextDue: addDays(5),
        isActive: true,
        notes: "Aylık ekstresi otomatik ödendiğinde sıfırla.",
      },
      {
        name: "Portekiz Oturma İzni",
        category: "legal",
        amount: 1_200,
        currency: "EUR",
        frequency: "yearly",
        nextDue: addDays(45),
        isActive: true,
        notes: "Belgeler hazır, tarih yaklaşınca reminder.",
      },
      {
        name: "Yıllık Sigorta",
        category: "payment",
        amount: 12_450,
        currency: "TRY",
        frequency: "yearly",
        nextDue: addDays(120),
        isActive: true,
      },
    ].map((obligation) =>
      prisma.obligation.create({
        data: {
          userId: user.id,
          ...obligation,
        },
      }),
    ),
  );

  await prisma.reminder.createMany({
    data: [
      {
        userId: user.id,
        title: "Portekiz Mayıs Toplantısı",
        description: "Vize dosyası + resmi evraklar",
        dueAt: addDays(30),
        isVeryImportant: true,
        relatedObligationId: obligationRecords[1].id,
      },
      {
        userId: user.id,
        title: "Kredi Kartı Ödemesi",
        description: "QNB ekstresi",
        dueAt: addDays(5),
        isVeryImportant: true,
        relatedObligationId: obligationRecords[0].id,
      },
      {
        userId: user.id,
        title: "Doktor Kontrolü",
        dueAt: addDays(50),
        isVeryImportant: false,
      },
      {
        userId: user.id,
        title: "Annemle Görüş",
        dueAt: addDays(12),
        isVeryImportant: false,
      },
    ],
  });

  await prisma.journalEntry.createMany({
    data: [
      {
        userId: user.id,
        title: "Likiditeyi artır",
        body: "USD mevduatı %10 azaltıp TL nakde kaydır.",
      },
      {
        userId: user.id,
        title: "Arsa planı",
        body: "Arnavutköy arsa ekspertiz teklifleri için 3 firmayla konuş.",
      },
      {
        userId: user.id,
        title: "Portekiz dosyası",
        body: "Reminder + obligation bağını uygulamada hazırla.",
      },
    ],
  });

  await prisma.pageLayout.createMany({
    data: [
      {
        userId: user.id,
        pageKey: "dashboard",
        layout: {
          widgets: [
            { key: "assets_table", x: 0, y: 0, w: 7, h: 3 },
            { key: "obligations_table", x: 7, y: 0, w: 5, h: 3 },
            { key: "important_reminders", x: 0, y: 3, w: 12, h: 2 },
          ],
        },
      },
      {
        userId: user.id,
        pageKey: "assets",
        layout: {
          widgets: [{ key: "assets_table", x: 0, y: 0, w: 12, h: 5 }],
        },
      },
    ],
  });
}

function addDays(days: number) {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
