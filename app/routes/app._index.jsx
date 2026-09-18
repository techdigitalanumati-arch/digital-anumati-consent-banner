import { useEffect, useState } from "react";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  let headScript = "";
  try {
    const response = await admin.graphql(
      `#graphql
      query GetAppInstallationScript {
        currentAppInstallation {
          metafield(namespace: "abymdac", key: "head_script") {
            value
          }
        }
      }`
    );
    const data = await response.json();
    headScript = data.data?.currentAppInstallation?.metafield?.value || "";
  } catch (error) {
    console.error("Error fetching app metafield:", error);
  }

  const shopHandle = session.shop ? session.shop.replace(".myshopify.com", "") : "";
  const themeEditorUrl = session.shop
    ? `https://admin.shopify.com/store/${shopHandle}/themes/current/editor?context=apps&activateAppId=6044d8bf-0ebd-7ea5-ebdc-9c45f4c2237a98c97362/digital-anumati-consent`
    : "https://admin.shopify.com/store/current/themes/current/editor?context=apps";

  return {
    headScript,
    shop: session.shop,
    themeEditorUrl,
  };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const headScript = (formData.get("head_script") || "").toString();

  try {
    const appInstallRes = await admin.graphql(
      `#graphql
      query GetAppInstallationId {
        currentAppInstallation {
          id
          metafield(namespace: "abymdac", key: "head_script") {
            id
          }
        }
      }`
    );
    const appInstallData = await appInstallRes.json();
    const appInstallation = appInstallData.data?.currentAppInstallation;
    const ownerId = appInstallation?.id;
    const existingMetafieldId = appInstallation?.metafield?.id;

    if (!ownerId) {
      return { success: false, error: "Unable to find app installation ID", headScript };
    }

    if (headScript.trim()) {
      const setRes = await admin.graphql(
        `#graphql
        mutation SetHeadScript($metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              key
              value
            }
            userErrors {
              field
              message
            }
          }
        }`,
        {
          variables: {
            metafields: [
              {
                ownerId,
                namespace: "abymdac",
                key: "head_script",
                type: "multi_line_text_field",
                value: headScript.trim(),
              },
            ],
          },
        }
      );
      const setResult = await setRes.json();
      if (setResult.data?.metafieldsSet?.userErrors?.length) {
        return {
          success: false,
          error: setResult.data.metafieldsSet.userErrors[0].message,
          headScript,
        };
      }
    } else if (existingMetafieldId) {
      await admin.graphql(
        `#graphql
        mutation DeleteMetafield($input: MetafieldDeleteInput!) {
          metafieldDelete(input: $input) {
            deletedId
            userErrors {
              field
              message
            }
          }
        }`,
        {
          variables: {
            input: { id: existingMetafieldId },
          },
        }
      );
    }

    return { success: true, headScript: headScript.trim() };
  } catch (error) {
    console.error("Error saving script:", error);
    return { success: false, error: error.message || "Failed to save script", headScript };
  }
};

export default function Index() {
  const shopify = useAppBridge();
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();

  const [scriptValue, setScriptValue] = useState(loaderData?.headScript || "");
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.headScript !== undefined) {
      setScriptValue(actionData.headScript);
    }
  }, [actionData]);

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show("Header script saved successfully!");
    } else if (actionData?.error) {
      shopify.toast.show(actionData.error, { isError: true });
    }
  }, [actionData, shopify]);

  const openThemeEditor = () => {
    window.open(loaderData.themeEditorUrl, "_blank");
  };

  const isConfigured = Boolean(scriptValue && scriptValue.trim());

  return (
    <s-page heading="Digital Anumati Consent">
      <s-button slot="primary-action" onClick={openThemeEditor}>
        Open Theme Customizer (App Embeds)
      </s-button>

      {!isConfigured && (
        <s-banner
          tone="warning"
          heading="Digital Anumati is almost ready"
          style={{ marginBottom: "1rem" }}
        >
          Please paste your full Digital Anumati header script below and click{" "}
          <strong>Save Changes</strong>.
        </s-banner>
      )}

      {isConfigured && (
        <s-banner
          tone="success"
          heading="Digital Anumati Consent Active"
          style={{ marginBottom: "1rem" }}
        >
          Your Header Script is saved and ready. Ensure the App Embed is toggled
          ON in your Theme Customizer.
        </s-banner>
      )}

      <s-section heading="Header Script Configuration">
        <s-paragraph>
          Paste your full Digital Anumati script tag here. It will be added
          directly into the <code>&lt;head&gt;</code> section of your website.
        </s-paragraph>

        <Form method="post" style={{ marginTop: "1rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="head_script"
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "0.5rem",
              }}
            >
              Header Script
            </label>
            <textarea
              id="head_script"
              name="head_script"
              rows={8}
              value={scriptValue}
              onChange={(e) => setScriptValue(e.target.value)}
              placeholder="write script here"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px",
                fontFamily: "monospace",
                fontSize: "13px",
                lineHeight: "1.4",
                border: "1px solid #ccc",
                borderRadius: "6px",
                backgroundColor: "#f9f9f9",
                resize: "vertical",
              }}
            />
            <p
              style={{
                margin: "6px 0 0",
                color: "#666",
                fontSize: "12px",
              }}
            >
              You can paste the complete <code>&lt;script ...&gt;&lt;/script&gt;</code> tag
              or direct script URL provided by your Digital Anumati account.
            </p>
          </div>

          <s-button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </s-button>
        </Form>
      </s-section>

      <s-section heading="Quick Setup Steps 🚀">
        <s-ordered-list style={{ marginTop: "0.5rem" }}>
          <s-list-item>
            <strong>Paste Header Script:</strong> Enter your Digital Anumati script tag in the field above and click <strong>Save Changes</strong>.
          </s-list-item>
          <s-list-item>
            <strong>Open Theme Customizer:</strong> Click the <strong>Open Theme Customizer (App Embeds)</strong> button above.
          </s-list-item>
          <s-list-item>
            <strong>Enable App Embed:</strong> In the <strong>App embeds</strong> tab on the left, toggle <strong>Digital Anumati Consent</strong> to <strong>ON</strong>.
          </s-list-item>
          <s-list-item>
            <strong>Save Changes in Theme:</strong> Click <strong>Save</strong> in the top right corner of the Shopify Theme Editor.
          </s-list-item>
        </s-ordered-list>
      </s-section>

      <s-section heading="Verification & Troubleshooting 🔍">
        <s-paragraph>
          To verify that the Digital Anumati script is correctly loaded into your website:
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>
            Visit your storefront homepage and open <strong>View Page Source</strong> (press <code>CTRL + U</code> on Windows or <code>CMD + Option + U</code> on Mac).
          </s-list-item>
          <s-list-item>
            Search (<code>CTRL + F</code>) for <code>digitalanumati</code> or <code>abymdac</code>.
          </s-list-item>
          <s-list-item>
            You will see your Digital Anumati header script loaded in the <code>&lt;head&gt;</code> section.
          </s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="Frequently Asked Questions (FAQ) ❓">
        <s-paragraph>
          <strong>What is a DPDP consent banner?</strong>
          <br />
          A DPDP consent banner is a website notice that asks visitors for clear, specific consent to process their personal data, as required under India&apos;s Digital Personal Data Protection Act (DPDP Act 2023) and DPDP Rules 2025.
        </s-paragraph>
        <s-paragraph>
          <strong>Do I need a Digital Anumati account?</strong>
          <br />
          Yes. This app connects your Shopify store to your Digital Anumati account. Paste the script provided by your Digital Anumati dashboard.
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="External Resources">
        <s-paragraph>
          <s-link href="https://digitalanumati.com/" target="_blank">
            Digital Anumati Website
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-link href="https://digitalanumati.com/term-of-use" target="_blank">
            Terms of Use
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-link href="https://digitalanumati.com/privacy-policy/" target="_blank">
            Privacy Policy
          </s-link>
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Plugin Specs & Support">
        <s-paragraph>
          <s-text>Version: </s-text>
          <code>1.0.0</code>
        </s-paragraph>
        <s-paragraph>
          <s-text>Author: </s-text>
          <code>Abym Technology</code>
        </s-paragraph>
        <s-paragraph>
          <s-text>Support Email: </s-text>
          <s-link href="mailto:tech.digitalanumati@gmail.com">
            tech.digitalanumati@gmail.com
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-text>Header Script Support: </s-text>
          <code>&lt;script&gt; tag &amp; URL</code>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
