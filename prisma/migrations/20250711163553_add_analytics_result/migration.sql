-- AddForeignKey
ALTER TABLE `AnalyticsResult` ADD CONSTRAINT `AnalyticsResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
