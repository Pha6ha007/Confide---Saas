-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "emotional_anchors" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "style_metrics" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "topic_connections" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "what_didnt_work" JSONB NOT NULL DEFAULT '[]';
