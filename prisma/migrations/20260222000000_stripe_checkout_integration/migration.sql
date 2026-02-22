-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'EXPIRED');

-- AlterEnum (add CONFIRMED to OrderStatus)
ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED' BEFORE 'PROCESSING';

-- Convert price fields from Float to Int (cents)
-- Existing prices are whole-dollar Float values (e.g., 2890.0 = $2,890)
-- Converting to cents: multiply by 100
ALTER TABLE "Product" ALTER COLUMN "price" TYPE INTEGER USING ("price" * 100)::INTEGER;
ALTER TABLE "Product" ALTER COLUMN "compareAtPrice" TYPE INTEGER USING ("compareAtPrice" * 100)::INTEGER;
ALTER TABLE "Order" ALTER COLUMN "total" TYPE INTEGER USING ("total" * 100)::INTEGER;
ALTER TABLE "OrderItem" ALTER COLUMN "price" TYPE INTEGER USING ("price" * 100)::INTEGER;

-- Add new fields to Order
ALTER TABLE "Order" ADD COLUMN "orderNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Order" ADD COLUMN "stripeSessionId" TEXT;
ALTER TABLE "Order" ADD COLUMN "stripePaymentId" TEXT;
ALTER TABLE "Order" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Set default values for existing shipping fields (for Stripe-flow orders)
ALTER TABLE "Order" ALTER COLUMN "shippingAddress" SET DEFAULT '';
ALTER TABLE "Order" ALTER COLUMN "shippingCity" SET DEFAULT '';
ALTER TABLE "Order" ALTER COLUMN "shippingZip" SET DEFAULT '';
ALTER TABLE "Order" ALTER COLUMN "shippingCountry" SET DEFAULT '';

-- Add unique constraints
ALTER TABLE "Order" ADD CONSTRAINT "Order_orderNumber_key" UNIQUE ("orderNumber");
ALTER TABLE "Order" ADD CONSTRAINT "Order_stripeSessionId_key" UNIQUE ("stripeSessionId");

-- Add indexes to Order
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- Add indexes to OrderItem
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateTable: ShippingAddress
CREATE TABLE "ShippingAddress" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "ShippingAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingAddress_orderId_key" ON "ShippingAddress"("orderId");

-- AddForeignKey
ALTER TABLE "ShippingAddress" ADD CONSTRAINT "ShippingAddress_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
