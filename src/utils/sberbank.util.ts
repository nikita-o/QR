import axios from "axios";
import {HTTP_HOST, sberLogin, sberPass, urlSberPayment} from "../config";
import * as https from "https";

export function registerCertificate(orderNumber: string, amount: number) {
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    return axios.post(`${urlSberPayment}/register.do`, {
        userName: sberLogin,
        password: sberPass,
        returnUrl: `${HTTP_HOST}/accept-buy-certificate`,
        // failUrl: `${HTTP_HOST}/fail-payment`,
        amount,
        orderNumber,
    }, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        httpsAgent,
    }).then(data => data.data)
      .catch(err => {
          console.log(err);
      });
}

export async function checkStatusCertificate(orderNumber: string): Promise<void> {
    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });

    const orderStatus: number = await axios.post(`${urlSberPayment}/getOrderStatusExtended.do`, {
        userName: sberLogin,
        password: sberPass,
        orderNumber,
    }, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        httpsAgent,
    }).then(data => data.data.orderStatus);

    switch (orderStatus) {
        case 0:
            throw new Error("заказ зарегистрирован, но не оплачен");
        case 1:
            throw new Error("предавторизованная сумма удержана (для двухстадийных платежей)");
        case 3:
            throw new Error("авторизация отменена");
        case 4:
            throw new Error("по транзакции была проведена операция возврата");
        case 5:
            throw new Error("инициирована авторизация через сервер контроля доступа банка-эмитента");
        case 6:
            throw new Error("авторизация отклонена");
    }
}
