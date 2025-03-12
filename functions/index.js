const { onRequest, onCall } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const Stripe = require("stripe");

// Initialize Firebase
initializeApp();
const db = getFirestore();

// Define environment parameters
const stripeSecretKey = defineString("STRIPE_SECRET_KEY", {
  description: "Stripe Secret API key"
});
const stripeWebhookSecret = defineString("STRIPE_WEBHOOK_SECRET", {
  description: "Stripe Webhook Signing Secret"
});

// Initialize Stripe with the secret key
const getStripe = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY || 
                   stripeSecretKey.value());
};

// Webhook handler for Stripe events
exports.stripeWebhook = onRequest({
    cors: [
        "https://bidright.app", 
        "https://www.bidright.app",
        "http://localhost:3000"
        ],
  maxInstances: 10
}, async (req, res) => {
  const stripe = getStripe();
  const signature = req.headers["stripe-signature"];
  
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 
                          stripeWebhookSecret.value();
    
    // Verify and construct the event
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      webhookSecret
    );
    
    console.log(`Webhook received: ${event.type}`);
    
    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutComplete(event.data.object);
        break;
        
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object);
        break;
        
      case "customer.subscription.deleted":
        await handleSubscriptionDeletion(event.data.object);
        break;
        
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Return a 200 response to acknowledge receipt of the event
    res.status(200).send({ received: true });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Customer portal session creation function
exports.createCustomerPortalSession = onCall({
    cors: [
        "https://bidright.app", 
        "https://www.bidright.app",
        "http://localhost:3000"
        ],
  maxInstances: 10
}, async (request) => {
  const stripe = getStripe();
  const { auth, data } = request;
  
  // Check authentication
  if (!auth) {
    throw new Error("The function must be called while authenticated.");
  }
  
  try {
    const userId = auth.uid;
    
    // Get customer ID from Firestore
    const customerDoc = await db.collection("customers").doc(userId).get();
    
    if (!customerDoc.exists) {
      throw new Error("Customer not found");
    }
    
    const customerId = customerDoc.data().stripeCustomerId;
    
    if (!customerId) {
      throw new Error("Stripe customer ID not found");
    }
    
    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: data.returnUrl || "https://bidright.app/subscription",
    });
    
    return { url: session.url };
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    throw new Error(error.message);
  }
});

// Handle checkout completion
async function handleCheckoutComplete(session) {
  const stripe = getStripe();
  
  try {
    if (session.mode === "subscription") {
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const customerId = session.customer;
      
      // Find the user by Stripe customer ID
      const customersRef = db.collection("customers");
      const snapshot = await customersRef.where("stripeCustomerId", "==", customerId).get();
      
      if (snapshot.empty) {
        console.log("No matching customer found for:", customerId);
        return;
      }
      
      const customerDoc = snapshot.docs[0];
      const userId = customerDoc.id;
      
      // Get plan info from metadata or price
      let planId = "pro"; // Default
      let isAnnual = false;
      
      // Determine if annual from subscription interval
      if (subscription.items.data.length > 0) {
        const item = subscription.items.data[0];
        if (item.plan && item.plan.interval === "year") {
          isAnnual = true;
        }
      }
      
      // Update user document with subscription info
      await db.collection("users").doc(userId).update({
        isSubscribed: true,
        plan: planId,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
        subscriptionCanceled: subscription.cancel_at_period_end,
        isAnnualBilling: isAnnual,
        updatedAt: new Date()
      });
      
      console.log(`Updated subscription for user ${userId}`);
    }
  } catch (error) {
    console.error("Error handling checkout completion:", error);
  }
}

// Handle subscription update
async function handleSubscriptionUpdate(subscription) {
  try {
    const customerId = subscription.customer;
    
    // Find the user by Stripe customer ID
    const customersRef = db.collection("customers");
    const snapshot = await customersRef.where("stripeCustomerId", "==", customerId).get();
    
    if (snapshot.empty) {
      console.log("No matching customer found for:", customerId);
      return;
    }
    
    const customerDoc = snapshot.docs[0];
    const userId = customerDoc.id;
    
    // Update user document with subscription info
    await db.collection("users").doc(userId).update({
      isSubscribed: subscription.status === "active" || subscription.status === "trialing",
      subscriptionStatus: subscription.status,
      subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000),
      subscriptionCanceled: subscription.cancel_at_period_end,
      updatedAt: new Date()
    });
    
    console.log(`Updated subscription status for user ${userId}`);
  } catch (error) {
    console.error("Error handling subscription update:", error);
  }
}

// Handle subscription deletion
async function handleSubscriptionDeletion(subscription) {
  try {
    const customerId = subscription.customer;
    
    // Find the user by Stripe customer ID
    const customersRef = db.collection("customers");
    const snapshot = await customersRef.where("stripeCustomerId", "==", customerId).get();
    
    if (snapshot.empty) {
      console.log("No matching customer found for:", customerId);
      return;
    }
    
    const customerDoc = snapshot.docs[0];
    const userId = customerDoc.id;
    
    // Update user document
    await db.collection("users").doc(userId).update({
      isSubscribed: false,
      subscriptionStatus: "canceled",
      plan: "free",
      updatedAt: new Date()
    });
    
    console.log(`Subscription canceled for user ${userId}`);
  } catch (error) {
    console.error("Error handling subscription deletion:", error);
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  try {
    const customerId = invoice.customer;
    
    // Find the user by Stripe customer ID
    const customersRef = db.collection("customers");
    const snapshot = await customersRef.where("stripeCustomerId", "==", customerId).get();
    
    if (snapshot.empty) {
      console.log("No matching customer found for:", customerId);
      return;
    }
    
    const customerDoc = snapshot.docs[0];
    const userId = customerDoc.id;
    
    // Update user document
    await db.collection("users").doc(userId).update({
      paymentFailed: true,
      lastPaymentFailure: new Date()
    });
    
    console.log(`Payment failed for user ${userId}`);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}