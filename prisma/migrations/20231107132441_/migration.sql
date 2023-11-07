-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('ADVENCED', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'FAILED', 'CONFIRMED', 'CREATED', 'RESOLVED', 'DELAYED');

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "type" "SubscriptionType" NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "amount" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "txid" TEXT,
    "code" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
