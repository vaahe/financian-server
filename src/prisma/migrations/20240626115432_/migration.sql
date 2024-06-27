/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Video` table. All the data in the column will be lost.
  - Added the required column `filename` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Video_courseId_idx";

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "createdAt",
DROP COLUMN "duration",
DROP COLUMN "title",
DROP COLUMN "url",
ADD COLUMN     "filename" TEXT NOT NULL;
