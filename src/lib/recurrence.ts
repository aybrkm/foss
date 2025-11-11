type Args = {
  baseDate: Date | null;
  recurrenceUnit?: "week" | "month" | null;
  recurrenceInterval?: number | null;
  now?: Date;
};

export function computeNextDue({
  baseDate,
  recurrenceUnit,
  recurrenceInterval,
  now = new Date(),
}: Args): Date | null {
  if (!baseDate) {
    return null;
  }
  if (!recurrenceUnit || !recurrenceInterval || recurrenceInterval <= 0) {
    return stripTime(baseDate);
  }

  const candidate = stripTime(baseDate);
  const target = stripTime(now).getTime();

  while (candidate.getTime() < target) {
    if (recurrenceUnit === "week") {
      candidate.setDate(candidate.getDate() + 7 * recurrenceInterval);
    } else {
      const originalDay = candidate.getDate();
      candidate.setMonth(candidate.getMonth() + recurrenceInterval, 1);
      const lastDay = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate();
      candidate.setDate(Math.min(originalDay, lastDay));
    }
  }

  return candidate;
}

function stripTime(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}
