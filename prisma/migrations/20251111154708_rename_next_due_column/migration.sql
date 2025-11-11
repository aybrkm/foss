-- Rename nextDueDate column to nextDue to keep existing data
ALTER TABLE "Obligation" RENAME COLUMN "nextDueDate" TO "nextDue";
