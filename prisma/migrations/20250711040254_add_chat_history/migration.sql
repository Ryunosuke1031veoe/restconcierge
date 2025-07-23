-- CreateTable
CREATE TABLE `AnalyticsResult` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `totalSales` DOUBLE NOT NULL,
    `totalOrders` INTEGER NOT NULL,
    `avgSalesPerCustomer` DOUBLE NOT NULL,
    `topMenuItem` VARCHAR(191) NULL,
    `aiSummary` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
