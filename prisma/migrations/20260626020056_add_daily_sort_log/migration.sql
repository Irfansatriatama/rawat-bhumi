-- CreateTable
CREATE TABLE "daily_sort_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_sort_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_sort_logs_userId_idx" ON "daily_sort_logs"("userId");

-- CreateIndex
CREATE INDEX "daily_sort_logs_date_idx" ON "daily_sort_logs"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_sort_logs_userId_date_category_key" ON "daily_sort_logs"("userId", "date", "category");
