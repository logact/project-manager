-- AlterTable
ALTER TABLE "Issue" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Issue" ADD COLUMN "archived_at" BIGINT;
