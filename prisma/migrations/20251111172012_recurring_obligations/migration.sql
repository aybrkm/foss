-- CreateEnum
CREATE TYPE "RecurrenceUnit" AS ENUM ('week', 'month');

-- AlterTable
ALTER TABLE "Obligation" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurrenceInterval" INTEGER,
ADD COLUMN     "recurrenceUnit" "RecurrenceUnit";
