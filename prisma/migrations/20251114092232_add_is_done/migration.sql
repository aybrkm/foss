-- AlterTable
ALTER TABLE "Obligation" ADD COLUMN     "isDone" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "isDone" BOOLEAN NOT NULL DEFAULT false;
