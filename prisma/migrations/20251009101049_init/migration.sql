-- CreateTable
CREATE TABLE "roads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "road_id" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "buffer_before_hours" INTEGER NOT NULL,
    "buffer_after_hours" INTEGER NOT NULL,
    "exceptions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_road_id_fkey" FOREIGN KEY ("road_id") REFERENCES "roads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
