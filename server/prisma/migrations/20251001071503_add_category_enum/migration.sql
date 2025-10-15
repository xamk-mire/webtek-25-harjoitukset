-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GENERAL', 'WORK', 'STUDY', 'HOME');

-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'GENERAL';
