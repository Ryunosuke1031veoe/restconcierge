/*
  Warnings:

  - You are about to drop the column `aiSummary` on the `analyticsresult` table. All the data in the column will be lost.
  - You are about to drop the column `avgSalesPerCustomer` on the `analyticsresult` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `analyticsresult` table. All the data in the column will be lost.
  - You are about to drop the column `topMenuItem` on the `analyticsresult` table. All the data in the column will be lost.
  - Added the required column `averageSpend` to the `AnalyticsResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailyMenuBreakdown` to the `AnalyticsResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dailySales` to the `AnalyticsResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `AnalyticsResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `menuSales` to the `AnalyticsResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordCount` to the `AnalyticsResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `AnalyticsResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDays` to the `AnalyticsResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AnalyticsResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weatherSales` to the `AnalyticsResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `SalesRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SalesRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weather` to the `SalesRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `analyticsresult` DROP FOREIGN KEY `AnalyticsResult_userId_fkey`;

-- DropForeignKey
ALTER TABLE `chatsession` DROP FOREIGN KEY `ChatSession_userId_fkey`;

-- DropForeignKey
ALTER TABLE `salesrecord` DROP FOREIGN KEY `SalesRecord_userId_fkey`;

-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_userId_fkey`;

-- DropIndex
DROP INDEX `Account_userId_fkey` ON `account`;

-- DropIndex
DROP INDEX `Session_userId_fkey` ON `session`;

-- AlterTable
ALTER TABLE `account` MODIFY `refresh_token` TEXT NULL,
    MODIFY `access_token` TEXT NULL,
    MODIFY `id_token` TEXT NULL;

-- AlterTable
ALTER TABLE `analyticsresult` DROP COLUMN `aiSummary`,
    DROP COLUMN `avgSalesPerCustomer`,
    DROP COLUMN `date`,
    DROP COLUMN `topMenuItem`,
    ADD COLUMN `aiAnalysis` TEXT NULL,
    ADD COLUMN `aiAnalysisStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `averageSpend` DOUBLE NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `dailyMenuBreakdown` JSON NOT NULL,
    ADD COLUMN `dailySales` JSON NOT NULL,
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `fileName` VARCHAR(191) NULL,
    ADD COLUMN `menuSales` JSON NOT NULL,
    ADD COLUMN `recordCount` INTEGER NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD COLUMN `totalDays` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `weatherSales` JSON NOT NULL;

-- AlterTable
ALTER TABLE `salesrecord` ADD COLUMN `amount` DOUBLE NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `weather` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE INDEX `AnalyticsResult_startDate_idx` ON `AnalyticsResult`(`startDate`);

-- CreateIndex
CREATE INDEX `AnalyticsResult_endDate_idx` ON `AnalyticsResult`(`endDate`);

-- CreateIndex
CREATE INDEX `AnalyticsResult_createdAt_idx` ON `AnalyticsResult`(`createdAt`);

-- CreateIndex
CREATE INDEX `SalesRecord_date_idx` ON `SalesRecord`(`date`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesRecord` ADD CONSTRAINT `SalesRecord_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsResult` ADD CONSTRAINT `AnalyticsResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatSession` ADD CONSTRAINT `ChatSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `analyticsresult` RENAME INDEX `AnalyticsResult_userId_fkey` TO `AnalyticsResult_userId_idx`;
