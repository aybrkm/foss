import { PrismaClient } from "@prisma/client";

/**
 * Bu script mevcut tüm kayıtları verilen kullanıcıya bağlar.
 * Varsayılan: email = TARGET_EMAIL. Kullanıcı yoksa otomatik oluşturur.
 * Eğer Supabase user id'siyle eşleşsin istersen TARGET_USER_ID'yi doldur.
 *
 * Çalıştırma: npx tsx scripts/backfill-user-data.ts
 * .env içindeki DATABASE_URL kullanılır.
 */

const prisma = new PrismaClient();

const TARGET_EMAIL = "aybrkm@gmail.com";
// Supabase kullanıcı ID'niz varsa buraya ekleyebilirsiniz; yoksa otomatik UUID ile yeni user yaratılır.
const TARGET_USER_ID: string | null = "d583cfb0-ca7f-465a-ac4b-2976df7ddd55";

async function getOrCreateUser() {
  if (TARGET_USER_ID) {
    return prisma.user.upsert({
      where: { id: TARGET_USER_ID },
      update: { email: TARGET_EMAIL },
      create: { id: TARGET_USER_ID, email: TARGET_EMAIL },
    });
  }

  const existing = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
  });

  if (existing) {
    return existing;
  }

  return prisma.user.create({
    data: { email: TARGET_EMAIL },
  });
}

async function main() {
  const user = await getOrCreateUser();

  const updates = [
    { name: "Asset", action: prisma.asset.updateMany({ data: { userId: user.id } }) },
    { name: "Obligation", action: prisma.obligation.updateMany({ data: { userId: user.id } }) },
    { name: "Reminder", action: prisma.reminder.updateMany({ data: { userId: user.id } }) },
    { name: "JournalEntry", action: prisma.journalEntry.updateMany({ data: { userId: user.id } }) },
    { name: "PageLayout", action: prisma.pageLayout.updateMany({ data: { userId: user.id } }) },
    { name: "WorkspaceColumn", action: prisma.workspaceColumn.updateMany({ data: { userId: user.id } }) },
    { name: "WorkspaceCard", action: prisma.workspaceCard.updateMany({ data: { userId: user.id } }) },
    { name: "DigitalAccount", action: prisma.digitalAccount.updateMany({ data: { userId: user.id } }) },
    { name: "DigitalSubscription", action: prisma.digitalSubscription.updateMany({ data: { userId: user.id } }) },
    { name: "CashflowIncome", action: prisma.cashflowIncome.updateMany({ data: { userId: user.id } }) },
  ];

  const results = await Promise.all(updates.map((item) => item.action.then((res) => ({ name: item.name, count: res.count }))));

  results.forEach((result) => {
    console.log(`${result.name}: ${result.count} kayıt güncellendi`);
  });

  console.log("Backfill tamamlandı. User ID:", user.id);
}

main()
  .catch((error) => {
    console.error("Hata:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
