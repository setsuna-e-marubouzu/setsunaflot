import Stripe from "stripe";
import { ENV } from "./_core/env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!ENV.stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    _stripe = new Stripe(ENV.stripeSecretKey);
  }
  return _stripe;
}

/**
 * Create a Stripe customer for a user
 */
export async function createStripeCustomer(email: string, name?: string) {
  const stripe = getStripe();
  
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      createdAt: new Date().toISOString(),
    },
  });
  
  return customer;
}

/**
 * Create a subscription for a user
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
) {
  const stripe = getStripe();
  
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });
  
  return subscription;
}

/**
 * Create a payment intent for one-time purchase
 */
export async function createPaymentIntent(
  customerId: string,
  priceId: string,
  amountJpy: number,
  metadata?: Record<string, string>
) {
  const stripe = getStripe();
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountJpy * 100, // Convert to cents
    currency: "jpy",
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  });
  
  return paymentIntent;
}

/**
 * Retrieve a subscription
 */
export async function getSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(paymentIntentId: string) {
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(body, signature, secret);
}
