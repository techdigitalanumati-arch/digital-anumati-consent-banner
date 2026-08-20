import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const shopify = useAppBridge();

  const openThemeEditor = () => {
    // Open Shopify Theme Editor -> App Embeds tab directly
    window.open("https://admin.shopify.com/store/current/themes/current/editor?context=apps", "_blank");
  };

  return (
    <s-page heading="AbyM Consent Banner for Digital Anumati">
      <s-button slot="primary-action" onClick={openThemeEditor}>
        Open Theme Customizer (App Embeds)
      </s-button>

      <s-section heading="Connect your Shopify Store to Digital Anumati 🇮🇳">
        <s-paragraph>
          <strong>AbyM Consent Banner for Digital Anumati</strong> connects your Shopify store to Digital Anumati&apos;s consent banner service — a Consent Manager built for India&apos;s <strong>Digital Personal Data Protection Act (DPDP Act 2023)</strong> and <strong>DPDP Rules 2025</strong>.
        </s-paragraph>
      </s-section>

      <s-section heading="Quick Setup Steps 🚀">
        <s-ordered-list style={{ marginTop: "0.5rem" }}>
          <s-list-item>
            <strong>Open Theme Customizer:</strong> Click the <strong>Open Theme Customizer</strong> button above or go to <em>Online Store &gt; Themes &gt; Customize</em>.
          </s-list-item>
          <s-list-item>
            <strong>Enable App Embed:</strong> Select the <strong>App embeds</strong> tab in the left navigation sidebar and toggle <strong>Digital Anumati Consent</strong> to <strong>ON</strong>.
          </s-list-item>
          <s-list-item>
            <strong>Enter your Site Key:</strong> Paste your unique Site Key provided by your Digital Anumati account (e.g. <code>APP_khanna-hospital_1783346400770</code>).
          </s-list-item>
          <s-list-item>
            <strong>Save Changes:</strong> Click <strong>Save</strong> in the top right corner of the Theme Editor.
          </s-list-item>
        </s-ordered-list>
      </s-section>

      <s-section heading="Verification & Troubleshooting 🔍">
        <s-paragraph>
          To verify that the Digital Anumati scripts are correctly loaded into your website source:
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>
            Visit your storefront homepage and open <strong>View Page Source</strong> (press <code>CTRL + U</code> on Windows or <code>CMD + Option + U</code> on Mac).
          </s-list-item>
          <s-list-item>
            Search (<code>CTRL + F</code>) for <code>abymdac</code> or <code>consent.digitalanumati.com</code>.
          </s-list-item>
          <s-list-item>
            You will find both scripts loaded directly in the page HTML:
            <br />
            <code>&lt;script id=&quot;abymdac-blocker&quot; src=&quot;https://consent.digitalanumati.com/anumati-blocker.js&quot; data-site-key=&quot;...&quot;&gt;&lt;/script&gt;</code>
            <br />
            <code>&lt;script id=&quot;abymdac-consent&quot; src=&quot;https://consent.digitalanumati.com/anumati-dpdp-consent-v1.js&quot; defer&gt;&lt;/script&gt;</code>
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
          Yes. This app connects your Shopify store to your Digital Anumati account. You need a valid Site Key from your Digital Anumati dashboard.
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
          <s-text>Blocker Script: </s-text>
          <code>anumati-blocker.js</code>
        </s-paragraph>
        <s-paragraph>
          <s-text>Consent Script: </s-text>
          <code>anumati-dpdp-consent-v1.js</code>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
