CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Conversation_clerkId_updatedAt_idx"
ON "Conversation"("clerkId", "updatedAt");

CREATE INDEX "ChatMessage_conversationId_createdAt_idx"
ON "ChatMessage"("conversationId", "createdAt");

ALTER TABLE "ChatMessage"
ADD CONSTRAINT "ChatMessage_conversationId_fkey"
FOREIGN KEY ("conversationId")
REFERENCES "Conversation"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
