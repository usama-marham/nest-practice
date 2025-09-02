-- AlterTable
ALTER TABLE `users` ADD COLUMN `is_email_verified` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `posts_user_id_is_public_idx` ON `posts`(`user_id`, `is_public`);

-- CreateIndex
CREATE INDEX `users_is_active_role_idx` ON `users`(`is_active`, `role`);

-- CreateIndex
CREATE INDEX `users_email_role_idx` ON `users`(`email`, `role`);
