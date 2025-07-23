-- AlterTable
ALTER TABLE `user` ADD COLUMN `averageSpend` INTEGER NULL,
    ADD COLUMN `businessHours` VARCHAR(191) NULL,
    ADD COLUMN `challenges` JSON NULL,
    ADD COLUMN `seats` INTEGER NULL,
    ADD COLUMN `storeName` VARCHAR(191) NULL,
    ADD COLUMN `storeSettingsUpdatedAt` DATETIME(3) NULL,
    ADD COLUMN `storeType` VARCHAR(191) NULL;
