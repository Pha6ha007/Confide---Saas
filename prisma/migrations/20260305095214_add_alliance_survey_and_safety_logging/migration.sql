-- CreateTable
CREATE TABLE "alliance_surveys" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "session_number" INTEGER NOT NULL,
    "understanding" INTEGER NOT NULL,
    "trust" INTEGER NOT NULL,
    "helpfulness" INTEGER NOT NULL,
    "feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alliance_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "session_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "trigger_type" TEXT NOT NULL,
    "user_message" TEXT NOT NULL,
    "agent_response" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "alliance_surveys" ADD CONSTRAINT "alliance_surveys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_logs" ADD CONSTRAINT "safety_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
