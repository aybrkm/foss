import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { computeNextDue } from "@/lib/recurrence";

export async function GET() {
  const now = new Date();
  const obligations = await prisma.obligation.findMany({
    where: {
      isRecurring: true,
      nextDue: { lt: now },
      recurrenceInterval: { not: null },
      recurrenceUnit: { not: null },
    },
  });

  let updated = 0;

  type ObligationRecord = (typeof obligations)[number];

  await Promise.all(
    obligations.map(async (obligation: ObligationRecord) => {
      const nextDue = computeNextDue({
        baseDate: obligation.nextDue,
        recurrenceUnit: obligation.recurrenceUnit as "week" | "month" | null,
        recurrenceInterval: obligation.recurrenceInterval,
        now,
      });

      if (!nextDue) {
        return;
      }

      if (obligation.nextDue && nextDue.getTime() === obligation.nextDue.getTime()) {
        return;
      }

      await prisma.obligation.update({
        where: { id: obligation.id },
        data: { nextDue },
      });
      updated += 1;
    }),
  );

  return NextResponse.json({ updated });
}
