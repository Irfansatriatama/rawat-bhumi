-- AlterTable
ALTER TABLE "pickup_requests" ADD COLUMN     "instruction" TEXT;

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "pickupInstruction" TEXT,
ADD COLUMN     "pickupNote" TEXT;
