import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

const TARGET_USER_ID = "d583cfb0-ca7f-465a-ac4b-2976df7ddd55";
const NEW_MASTER_CODE = "123456";

async function main() {
  const hash = createHash("sha256").update(NEW_MASTER_CODE).digest("hex");

  const updated = await prisma.user.update({
    where: { id: TARGET_USER_ID },
    data: { masterKeyHash: hash },
  });

  console.log("Master kod resetlendi:", {
    userId: updated.id,
    email: updated.email,
    masterKeyHash: updated.masterKeyHash,
  });
}

main()
  .catch((error) => {
    console.error("Hata:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
