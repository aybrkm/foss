-- CreateTable
CREATE TABLE "WorkspaceColumn" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceCard" (
    "id" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceColumn_userId_position_idx" ON "WorkspaceColumn"("userId", "position");

-- CreateIndex
CREATE INDEX "WorkspaceCard_columnId_position_idx" ON "WorkspaceCard"("columnId", "position");

-- AddForeignKey
ALTER TABLE "WorkspaceColumn" ADD CONSTRAINT "WorkspaceColumn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceCard" ADD CONSTRAINT "WorkspaceCard_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "WorkspaceColumn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceCard" ADD CONSTRAINT "WorkspaceCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
