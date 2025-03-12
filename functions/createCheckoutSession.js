// functions/createCheckoutSession.js

const { onCall } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const Stripe = require("stripe");

// Initialize Firebase if not already initialized
try {
  initializeApp();
} catch (error) {
  // App already initialized
}

const db = getFirestore();

// Define environment parameters
const stripeSecretKey = defineString("STRIPE_SECRET_KEY", {
  description: "Stripe Secret API key"
});

// Price IDs for different subscription plans
const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_pro_monthly", 
  pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL || "price_pro_annual"
};

// Initialize Stripe with the secret key
const getStripe = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY || 
                   stripeSecretKey.value());
};

// Create a checkout session for subscription
exports.createCheckoutSession = onCall({
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
    throw new Error("You must be logged in to subscribe");
  }
  
  try {
    const { plan, isAnnual, successUrl, cancelUrl } = data;
    
    // Get the price ID for the selected plan
    const priceId = isAnnual ? PRICE_IDS[`${plan}_annual`] : PRICE_IDS[`${plan}_monthly`];
    
    if (!priceId) {
      throw new Error(`Invalid plan selected: ${plan}_${isAnnual ? 'annual' : 'monthly'}`);
    }
    
    // Get or create a Stripe customer for this user
    let customerDoc = await db.collection("customers").doc(auth.uid).get();
    let customerId;
    
    if (!customerDoc.exists || !customerDoc.data().stripeCustomerId) {
      // Get user details for creating customer
      const userDoc = await db.collection("users").doc(auth.uid).get();
      const userData = userDoc.data() || {};
      
      // Create a Stripe customer
      const customer = await stripe.customers.create({
        email: auth.token.email || userData.email,
        name: userData.displayName || auth.token.name,
        metadata: {
          firebaseUID: auth.uid
        }
      });
      
      customerId = customer.id;
      
      // Save Stripe customer ID to Firestore
      await db.collection("customers").doc(auth.uid).set({
        stripeCustomerId: customerId,
        email: auth.token.email || userData.email,
        createdAt: new Date()
      }, { merge: true });
    } else {
      customerId = customerDoc.data().stripeCustomerId;
    }
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: "subscription",
      subscription_data: {
        metadata: {
          planId: plan,
          isAnnual: isAnnual ? "true" : "false",
          firebaseUID: auth.uid
        }
      },
      success_url: successUrl || `${process.env.PUBLIC_URL || "https://bidright.app"}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.PUBLIC_URL || "https://bidright.app"}/subscription?canceled=true`
    });
    
    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error(error.message);
  }
});