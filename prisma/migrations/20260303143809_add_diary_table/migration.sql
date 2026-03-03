-- CreateTable
CREATE TABLE "diaries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "storage_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diaries_user_id_month_year_key" ON "diaries"("user_id", "month", "year");

-- AddForeignKey
ALTER TABLE "diaries" ADD CONSTRAINT "diaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
