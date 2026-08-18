(function () {
  "use strict";

  var config = document.getElementById(
    "digital-anumati-consent-config"
  );

  if (!config) {
    return;
  }

  var siteKey = (
    config.getAttribute("data-site-key") || ""
  ).trim();

  if (!siteKey) {
    console.warn(
      "Digital Anumati: Site Key is not configured."
    );
    return;
  }

  function loadScript(src, attributes, callback) {
    var existing = document.querySelector(
      'script[src="' + src + '"]'
    );

    if (existing) {
      if (callback) {
        callback();
      }
      return;
    }

    var script = document.createElement("script");

    script.src = src;
    script.async = false;

    Object.keys(attributes || {}).forEach(function (key) {
      script.setAttribute(key, attributes[key]);
    });

    if (callback) {
      script.onload = callback;
    }

    document.head.appendChild(script);
  }

  /*
   * Load Digital Anumati blocker first.
   * The Site Key is passed using data-site-key,
   * matching the original WordPress plugin.
   */
  loadScript(
    "https://consent.digitalanumati.com/anumati-blocker.js",
    {
      "data-site-key": siteKey
    },
    function () {
      /*
       * Load Digital Anumati DPDP consent banner
       * after the blocker has loaded.
       */
      loadScript(
        "https://consent.digitalanumati.com/anumati-dpdp-consent-v1.js",
        {}
      );
    }
  );
})();