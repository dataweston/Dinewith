-- CreateEnum
CREATE TYPE "StreamStatus" AS ENUM ('CREATED', 'LIVE', 'ENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StreamType" AS ENUM ('ONE_TO_ONE', 'SMALL_GROUP', 'BROADCAST');

-- CreateEnum
CREATE TYPE "PaymentProcessor" AS ENUM ('BRAINTREE', 'SQUARE');

-- CreateEnum
CREATE TYPE "FeeTransactionType" AS ENUM ('PLATFORM_FEE', 'REFUND', 'CHARGEBACK');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('LISTING', 'STREAM', 'USER', 'MESSAGE');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('INAPPROPRIATE_CONTENT', 'HARASSMENT', 'SPAM', 'FRAUD', 'SAFETY_CONCERN', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "Stream" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "StreamType" NOT NULL,
    "status" "StreamStatus" NOT NULL DEFAULT 'CREATED',
    "livepeerStreamId" TEXT,
    "playbackId" TEXT,
    "streamKey" TEXT,
    "agoraChannelName" TEXT,
    "agoraAppId" TEXT,
    "vodEnabled" BOOLEAN NOT NULL DEFAULT true,
    "vodUrl" TEXT,
    "vodExpiresAt" TIMESTAMP(3),
    "viewerCount" INTEGER NOT NULL DEFAULT 0,
    "maxViewers" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeTransaction" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" "FeeTransactionType" NOT NULL,
    "processor" "PaymentProcessor" NOT NULL,
    "bookingTotal" INTEGER NOT NULL,
    "platformFee" INTEGER NOT NULL,
    "hostPayout" INTEGER NOT NULL,
    "transactionId" TEXT,
    "paymentIntentId" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reportedUserId" TEXT,
    "listingId" TEXT,
    "streamId" TEXT,
    "description" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stream_livepeerStreamId_key" ON "Stream"("livepeerStreamId");

-- CreateIndex
CREATE INDEX "Stream_hostId_idx" ON "Stream"("hostId");

-- CreateIndex
CREATE INDEX "Stream_status_idx" ON "Stream"("status");

-- CreateIndex
CREATE INDEX "Stream_vodExpiresAt_idx" ON "Stream"("vodExpiresAt");

-- CreateIndex
CREATE INDEX "FeeTransaction_bookingId_idx" ON "FeeTransaction"("bookingId");

-- CreateIndex
CREATE INDEX "FeeTransaction_processed_idx" ON "FeeTransaction"("processed");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_type_idx" ON "Report"("type");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_reportedUserId_idx" ON "Report"("reportedUserId");

-- CreateIndex
CREATE INDEX "Report_listingId_idx" ON "Report"("listingId");

-- CreateIndex
CREATE INDEX "Report_streamId_idx" ON "Report"("streamId");

-- AddForeignKey
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Stream"("id") ON DELETE SET NULL ON UPDATE CASCADE;
