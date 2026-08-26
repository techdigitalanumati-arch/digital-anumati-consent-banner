import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const { topic, shop, payload } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}:`, payload);
  } catch (error) {
    console.log("Webhook processed:", error?.message || error);
  }

  return new Response("OK", { status: 200 });
};
