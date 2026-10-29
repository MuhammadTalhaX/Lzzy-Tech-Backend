
import prisma from "../lib/prisma.js";
import type { CreateOrderInput } from "../schemas/order.schema.js";

export const createOrder = async (input: CreateOrderInput) => {
  // Reject duplicate product IDs.
  const productIds = input.items.map((item) => item.productId);

  if (new Set(productIds).size !== productIds.length) {
    throw Object.assign(
      new Error("Duplicate products are not allowed in an order"),
      { statusCode: 400 },
    );
  }

  return prisma.$transaction(async (tx) => {
    // Acquire a transaction-level PostgreSQL advisory lock.
    // The query returns an integer instead of PostgreSQL's void type.
    await tx.$queryRaw`
      SELECT 1 AS locked
      FROM (SELECT pg_advisory_xact_lock(741852963)) AS lock_acquired
    `;

    // Fetch active products from the database.
    const products = await tx.product.findMany({
      where: {
        id: { in: productIds },
        isArchived: false,
      },
    });

    if (products.length !== productIds.length) {
      throw Object.assign(
        new Error(
          "One or more products do not exist or are archived",
        ),
        { statusCode: 400 },
      );
    }

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    let subtotal = 0;
    let discountTotal = 0;

    // Calculate prices using database values, never client-supplied prices.
    const orderItems = input.items.map((item) => {
      const product = productMap.get(item.productId)!;

      const originalPrice = Number(product.price);
      const sellingPrice =
        product.discountedPrice !== null
          ? Number(product.discountedPrice)
          : originalPrice;

      if (
        !Number.isFinite(originalPrice) ||
        !Number.isFinite(sellingPrice) ||
        originalPrice < 0 ||
        sellingPrice < 0 ||
        sellingPrice > originalPrice
      ) {
        throw Object.assign(
          new Error(`Invalid price configuration for ${product.name}`),
          { statusCode: 400 },
        );
      }

      const lineSubtotal = originalPrice * item.quantity;
      const lineDiscount =
        (originalPrice - sellingPrice) * item.quantity;
      const lineTotal = sellingPrice * item.quantity;

      subtotal += lineSubtotal;
      discountTotal += lineDiscount;

      return {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productSlug: product.slug,
        quantity: item.quantity,
        unitPrice: originalPrice.toFixed(2),
        unitDiscount: (originalPrice - sellingPrice).toFixed(2),
        lineTotal: lineTotal.toFixed(2),
      };
    });

    // Delivery pricing has not been configured yet.
    const deliveryCharge = 0;
    const totalAmount = subtotal - discountTotal + deliveryCharge;

    // Atomically increment the order counter.
    const counter = await tx.orderCounter.upsert({
      where: { id: 1 },
      create: { id: 1, value: 1 },
      update: { value: { increment: 1 } },
    });

    const orderNumber = `LZ-${String(counter.value).padStart(3, "0")}`;

    // Create order and order items in the same transaction.
    return tx.order.create({
      data: {
        orderNumber,
        customerName: input.customerName,
        contactNumber: input.contactNumber,
        deliveryAddress: input.deliveryAddress,
        city: input.city,
        deliveryNotes: input.deliveryNotes ?? null,
        subtotal: subtotal.toFixed(2),
        discountTotal: discountTotal.toFixed(2),
        deliveryCharge: deliveryCharge.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });
  });
};

export const getOrders = async () => {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });
};

export const getOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });
};

export const updateOrderStatus = async (
  id: string,
  status:
    | "PENDING_PAYMENT"
    | "PAYMENT_SUBMITTED"
    | "PAYMENT_VERIFIED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED",
) => {
  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    throw Object.assign(new Error("Order not found"), {
      statusCode: 404,
    });
  }

  // Payment must be verified before processing or shipping.
  if (
    ["PROCESSING", "SHIPPED", "DELIVERED"].includes(status) &&
    order.paymentStatus !== "VERIFIED"
  ) {
    throw Object.assign(
      new Error("Payment must be verified before processing this order"),
      { statusCode: 400 },
    );
  }

  return prisma.order.update({
    where: { id },
    data: { status },
  });
};

export const reviewOrderPayment = async (
  id: string,
  input: {
    action: "VERIFY" | "REJECT";
    paymentTransactionRef?: string;
    paymentAdminNote?: string;
  },
) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw Object.assign(new Error("Order not found"), {
        statusCode: 404,
      });
    }

    if (order.paymentStatus !== "SUBMITTED") {
      throw Object.assign(
        new Error("Payment must be submitted before admin review"),
        { statusCode: 400 },
      );
    }

    if (input.action === "VERIFY") {
      return tx.order.update({
        where: { id },
        data: {
          paymentStatus: "VERIFIED",
          status: "PAYMENT_VERIFIED",
          paymentTransactionRef: input.paymentTransactionRef ?? null,
          paymentAdminNote: input.paymentAdminNote ?? null,
          paymentVerifiedAt: new Date(),
        },
      });
    }

    return tx.order.update({
      where: { id },
      data: {
        paymentStatus: "REJECTED",
        status: "PENDING_PAYMENT",
        paymentAdminNote: input.paymentAdminNote ?? null,
        paymentVerifiedAt: null,
      },
    });
  });
};