import { Hono } from "hono";

const app = new Hono();
import { PrismaClient, SubscriptionType } from "@prisma/client";
import subscriptionPrices from "./config/subscription-prices";
import { env } from "./env";
import { coinbase_model } from "./utils/coinbase-model";
import { coinbaseAPI } from "./config/coinbase";
import { Root } from "./types";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV != "production") globalForPrisma.prisma;

app.post("/purchase", async (c) => {
  const { userId } = c.req.query();
  const { type } = await c.req.parseBody();
  const { username } = await c.req.parseBody();

  if (
    type !== SubscriptionType.PROFESSIONAL &&
    type !== SubscriptionType.ADVENCED
  ) {
    return c.json(
      {
        error: "type is required",
      },
      403
    );
  }

  if (!username) {
    return c.json(
      {
        error: "username is required",
      },
      403
    );
  }

  if (!userId) {
    return c.json(
      {
        error: "userId is required",
      },
      403
    );
  }

  if (!userId) {
    return c.json(
      {
        error: "userId is required",
      },
      403
    );
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      username: username as string,
      status: "CREATED",
      type: "ADVENCED",
      amount: `${subscriptionPrices[type]}`,
      code: "",
    },
  });

  const createCheckoutResponse = await fetch(coinbaseAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-CC-Api-Key": env.COINBASE_KEY,
      "X-CC-Version": "2018-03-22",
    },
    body: JSON.stringify(
      coinbase_model({
        userId: userId,
        amount: subscriptionPrices[type],
        paymentId: payment.id,
        type,
        username: payment.username,
      })
    ),
  });

  const checkout = await createCheckoutResponse.json();

  return c.json({
    paymentUrl: checkout.data.hosted_url,
  });
});

app.post("/webhook", async (c) => {
  try {
    const body = (await c.req.parseBody()) as unknown as Root;
    let date = new Date();
    let expiresAt = new Date(date);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    console.log(body);

    if (body.event.type === "charge:confirmed") {
      const { paymentId } = body.event?.data?.metadata;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "CONFIRMED",
        },
      });

      return c.json({
        success: true,
      });
    }

    if (body.event.type === "charge:created") {
      const { paymentId } = body.event?.data?.metadata;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "CREATED",
          code: body.event.data.code,
        },
      });

      return c.json({
        success: true,
      });
    }

    if (body.event.type === "charge:delayed") {
      const { paymentId } = body.event?.data?.metadata;
      const paymentTransactionId = body.event.data.payments[0]?.transaction_id;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "DELAYED",
          txid: paymentTransactionId,
          expiresAt,
        },
      });

      return c.json({
        success: true,
      });
    }

    if (body.event.type === "charge:failed") {
      const { paymentId } = body.event?.data?.metadata;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "FAILED",
        },
      });

      return c.json({
        success: true,
      });
    }

    if (body.event.type === "charge:pending") {
      const { paymentId } = body.event?.data?.metadata;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "PENDING",
        },
      });

      return c.json({
        success: true,
      });
    }

    if (body.event.type === "charge:resolved") {
      const { paymentId } = body.event?.data?.metadata;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "RESOLVED",
        },
      });

      return c.json({
        success: true,
      });
    }

    return c.json({
      success: true,
    });
    
  } catch (error) {
    c.json({
      success: false,
    });
  }
});

export default app;
