import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}:`, payload);

  // Digital Anumati cleanup task on shop redact / uninstall.
  // Return 200 OK to acknowledge receipt.
  return new Response("OK", { status: 200 });
};
