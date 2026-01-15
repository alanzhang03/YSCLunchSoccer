-- AlterTable
-- Make sessionId required and add foreign key constraint
-- Note: This assumes no existing payment records exist

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS "Payment_userId_idx";
DROP INDEX IF EXISTS "Payment_status_idx";

-- Add foreign key constraint to session
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraint for userId and sessionId combination
CREATE UNIQUE INDEX "Payment_userId_sessionId_key" ON "Payment"("userId", "sessionId");

-- Recreate indexes
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX "Payment_sessionId_idx" ON "Payment"("sessionId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
