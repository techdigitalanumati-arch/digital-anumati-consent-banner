import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}:`, payload);

  // Digital Anumati does not store customer personal data on Shopify servers.
  // Return 200 OK to acknowledge receipt.
  return new Response("OK", { status: 200 });
};
