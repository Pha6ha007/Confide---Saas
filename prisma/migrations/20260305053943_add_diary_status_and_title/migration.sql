-- AlterTable
ALTER TABLE "diaries" ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'generating',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "storage_url" DROP NOT NULL;
