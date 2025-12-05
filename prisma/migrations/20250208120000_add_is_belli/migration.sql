-- Add isBelli flag to obligations for "henüz belli değil" amounts
ALTER TABLE "Obligation" ADD COLUMN     "isBelli" BOOLEAN NOT NULL DEFAULT false;
