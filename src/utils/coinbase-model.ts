import { SubscriptionType } from "@prisma/client";

type CoinbaseModelType = {
  userId: string;
  amount: number;
  paymentId: string;
  type: SubscriptionType;
  username: string
};

export const coinbase_model = ({
  userId,
  amount,
  paymentId,
  username,
  type,
}: CoinbaseModelType) => ({
  pricing_type: "fixed_price",
  name: username,
  metadata: {
    userId,
    paymentId,
    type,
    username
  },
  local_price: {
    currency: "GBP",
    amount,
  },
});
