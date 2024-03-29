import axios from "axios";
import { HTTP_HOST, sberLogin, sberPass, sberToken, urlSberPayment } from "../config";
import * as https from "https";
import fs from "fs";

const httpsAgent = new https.Agent({
    ca: [
        fs.readFileSync('Cert_CA.pem'),
    ]
});

export async function registerCertificate(orderNumber: string, amount: number) {
    const { data } = await axios.post(`${urlSberPayment}/register.do`, {
        // userName: sberLogin,
        // password: sberPass,
        token: sberToken,
        returnUrl: `${HTTP_HOST}/accept-buy-certificate`,
        amount,
        orderNumber,
        sessionTimeoutSecs: 86400,
    }, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        httpsAgent,
    });

    console.log(data);

    return data;
}

export async function checkStatusCertificate(orderId: string): Promise<void> {
    const { data } = await axios.post(`${urlSberPayment}/getOrderStatusExtended.do`, {
        // userName: sberLogin,
        // password: sberPass,
        token: sberToken,
        orderId,
    }, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        httpsAgent,
    });

    console.log(data);

    if (data.orderStatus !== 2) {
        console.error(data);
        throw new Error(data.actionCodeDescription);
    }
}
