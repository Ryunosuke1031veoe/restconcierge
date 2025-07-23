-- CreateTable
CREATE TABLE `SalesRecord` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `menuItem` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `analyticsResultId` VARCHAR(191) NULL,

    INDEX `SalesRecord_userId_idx`(`userId`),
    INDEX `SalesRecord_analyticsResultId_idx`(`analyticsResultId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SalesRecord` ADD CONSTRAINT `SalesRecord_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesRecord` ADD CONSTRAINT `SalesRecord_analyticsResultId_fkey` FOREIGN KEY (`analyticsResultId`) REFERENCES `AnalyticsResult`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
