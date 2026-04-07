/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `DailyRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DailyRecord_userId_date_key" ON "DailyRecord"("userId", "date");
