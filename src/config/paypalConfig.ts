import * as paypal from '@paypal/checkout-server-sdk';

const environment = () => {
    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const clientSecret = process.env.PAYPAL_SECRET!;

    // test environment
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);

    // live environment
    // return new paypal.core.LiveEnvironment(clientId, clientSecret);
}

export function client() {
    return new paypal.core.PayPalHttpClient(environment());
}