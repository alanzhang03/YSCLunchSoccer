-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "lockedTeams" JSONB,
ADD COLUMN     "teamsLocked" BOOLEAN NOT NULL DEFAULT false;
