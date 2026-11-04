-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "goal" TEXT,
    "answer1" TEXT,
    "answer2" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "diet" TEXT,
    "experience" TEXT,
    "routine" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineCompletion" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "taskIndex" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "RoutineCompletion_clerkId_date_idx" ON "RoutineCompletion"("clerkId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineCompletion_clerkId_goal_date_taskIndex_key" ON "RoutineCompletion"("clerkId", "goal", "date", "taskIndex");

-- CreateIndex
CREATE INDEX "Conversation_clerkId_updatedAt_idx" ON "Conversation"("clerkId", "updatedAt");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_createdAt_idx" ON "ChatMessage"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User"("clerkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

