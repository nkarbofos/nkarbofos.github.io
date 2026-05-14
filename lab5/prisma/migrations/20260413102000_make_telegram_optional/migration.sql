-- Make telegram_url optional
ALTER TABLE "users" ALTER COLUMN "telegram_url" DROP NOT NULL;

