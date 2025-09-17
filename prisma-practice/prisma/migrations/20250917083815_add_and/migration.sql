-- AlterTable
ALTER TABLE `users` 
    ADD COLUMN `date_of_birth` DATETIME(3) NULL AFTER `password`,
    MODIFY `is_email_verified` tinyint(1) NOT NULL DEFAULT '0' AFTER `email`;
