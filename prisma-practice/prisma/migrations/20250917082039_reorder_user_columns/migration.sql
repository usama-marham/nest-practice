ALTER TABLE `users` 
  MODIFY COLUMN `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL AFTER `is_active`,
  MODIFY COLUMN `role` enum('USER','ADMIN','WRITER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER' AFTER `email`,
  MODIFY COLUMN `is_email_verified` tinyint(1) NOT NULL DEFAULT '0' AFTER `role`,
  MODIFY COLUMN `password` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'strong' AFTER `is_email_verified`,
  MODIFY COLUMN `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `password`,
  MODIFY COLUMN `updated_at` datetime(3) NOT NULL AFTER `created_at`,
  MODIFY COLUMN `deleted_at` datetime(3) DEFAULT NULL AFTER `updated_at`;