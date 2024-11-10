import type { ICreatePayment, Payment } from "@a2seven/yoo-checkout";
import { YooCheckout } from "@a2seven/yoo-checkout";
import { yookassaSecretKey, yookassaShopId } from "../config";

const checkout = new YooCheckout({
  shopId: yookassaShopId,
  secretKey: yookassaSecretKey,
});

export async function createPayment(
  orderNumber: string,
  amount: number,
): Promise<Payment> {
  const createPayload: ICreatePayment = {
    amount: {
      value: amount.toFixed(2),
      currency: "RUB",
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    payment_method_data: {
      type: "bank_card",
    },
    confirmation: {
      type: "redirect",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      return_url: "test",
    },
    // description: data.productName,
  };

  const payment = await checkout
    .createPayment(createPayload, orderNumber)
    .catch((e) => {
      console.error(e);
      throw e;
    });

  return payment;

  // return {
  //   orderId: payment.id,
  //   formUrl: payment.confirmation.confirmation_url,
  // };
}

export async function onCapture(payment: Payment) {
  await checkout.capturePayment(payment.id, {});
}
