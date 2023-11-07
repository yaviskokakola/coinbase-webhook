import express from "express";
import { PrismaClient, SubscriptionType } from "@prisma/client";
import subscriptionPrices from "./config/subscription-prices";
import { env } from "./env";
import cors from 'cors'
import { coinbase_model } from "./utils/coinbase-model";
import { coinbaseAPI } from "./config/coinbase";
import { Root } from "./types";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV != "production") globalForPrisma.prisma;

app.post("/purchase", async (req, res) => {
  const { userId } = req.query;
  const { type, username } = req.body;

  if (
    type !== SubscriptionType.PROFESSIONAL &&
    type !== SubscriptionType.ADVENCED
  ) {
    return res.status(403).send({
      error: "type is required",
    });
  }

  if (!username) {
    return res.status(403).send({
      error: "username is required",
    });
  }

  if (!userId) {
    return res.status(403).send({
      error: "userId is required",
    });
  }

  if (!userId) {
    return res.send({
      error: "userId is required",
    });
  }

  const payment = await prisma.payment.create({
    data: {
      userId: userId as string,
      username: username as string,
      status: "CREATED",
      type: "ADVENCED",
      amount: `${subscriptionPrices[type as SubscriptionType]}`,
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
        userId: userId as string,
        amount: subscriptionPrices[type as SubscriptionType],
        paymentId: payment.id,
        type,
        username: payment.username,
      })
    ),
  });

  const checkout = (await createCheckoutResponse.json()) as any;

  return res.send({
    paymentUrl: checkout.data.hosted_url,
  });
});

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body as Root;
    let date = new Date();
    let expiresAt = new Date(date);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    console.log(body);

    if (body?.event?.type === "charge:confirmed") {
      const { paymentId } = body.event?.data?.metadata;
      console.log("here?");

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "CONFIRMED",
        },
      });

      return res.send({
        success: true,
      });
    }

    if (body?.event?.type === "charge:created") {
      const { paymentId } = body.event?.data?.metadata;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "CREATED",
          code: body.event.data.code,
        },
      });

      return res.send({
        success: true,
      });
    }

    if (body?.event?.type === "charge:delayed") {
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

      return res.send({
        success: true,
      });
    }

    if (body?.event?.type === "charge:failed") {
      const { paymentId } = body.event?.data?.metadata;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "FAILED",
        },
      });

      return res.send({
        success: true,
      });
    }

    if (body?.event?.type === "charge:pending") {
      const { paymentId } = body.event?.data?.metadata;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "PENDING",
        },
      });

      return res.send({
        success: true,
      });
    }

    if (body?.event?.type === "charge:resolved") {
      const { paymentId } = body.event?.data?.metadata;

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "RESOLVED",
        },
      });

      return res.send({
        success: true,
      });
    }

    return res.send({
      success: true,
    });
  } catch (error) {
    res.send({
      success: false,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log('Server is runnning')
})
